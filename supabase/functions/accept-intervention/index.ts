import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { report_id, volunteer_id } = await req.json();
    if (!report_id || !volunteer_id) throw new Error('report_id and volunteer_id required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Atomic check: is the report still unassigned?
    const { data: report, error: reportErr } = await supabase
      .from('reports')
      .select('id, status, assigned_to, reporter_id, title')
      .eq('id', report_id)
      .single();

    if (reportErr || !report) throw new Error('Report not found');
    if (report.assigned_to) {
      return new Response(
        JSON.stringify({ success: false, reason: 'already_taken', message: 'Ce cas a déjà été pris en charge.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign the report atomically
    const { error: updateErr } = await supabase
      .from('reports')
      .update({ assigned_to: volunteer_id, status: 'assigned' })
      .eq('id', report_id)
      .is('assigned_to', null); // double-check in WHERE clause

    if (updateErr) throw new Error('Assignment failed — concurrent update');

    // Create intervention record
    const { error: intErr } = await supabase.from('interventions').insert({
      report_id,
      volunteer_id,
      status: 'accepted',
      started_at: new Date().toISOString(),
    });

    if (intErr) throw new Error('Failed to create intervention record');

    // Notify reporter
    await supabase.from('notifications').insert({
      user_id: report.reporter_id,
      type: 'assigned',
      title: '✅ Bénévole en route',
      body: `Un bénévole se dirige vers l'animal que vous avez signalé.`,
      data: { report_id, volunteer_id },
    });

    // Award reputation points to volunteer
    await supabase.rpc('increment_reputation', { user_id: volunteer_id, points: 5 });

    return new Response(
      JSON.stringify({ success: true, message: 'Intervention acceptée avec succès.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
