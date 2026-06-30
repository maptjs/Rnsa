import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { report_id, urgency } = await req.json();
    if (!report_id) throw new Error('report_id required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get report location
    const { data: report, error: reportErr } = await supabase
      .from('reports')
      .select('location, city')
      .eq('id', report_id)
      .single();

    if (reportErr || !report) throw new Error('Report not found');

    // Search radius by urgency (in meters)
    const radiusMap: Record<string, number> = {
      critical: 5000,
      high: 10000,
      medium: 20000,
      low: 20000,
    };
    const radius = radiusMap[urgency] ?? 10000;

    // Find available volunteers using PostGIS ST_DWithin
    const { data: volunteers, error: volErr } = await supabase.rpc('find_volunteers_near', {
      report_location: report.location,
      radius_meters: radius,
      max_results: 5,
    });

    if (volErr) {
      console.error('Volunteer search error:', volErr);
    }

    const matched = volunteers || [];

    // Send FCM notifications to top 3 volunteers
    const fcmKey = Deno.env.get('FCM_SERVER_KEY');
    const notifyPromises = matched.slice(0, 3).map(async (vol: { id: string; fcm_token: string | null; full_name: string }) => {
      // Insert notification record
      await supabase.from('notifications').insert({
        user_id: vol.id,
        type: 'new_case',
        title: '🆘 Nouveau cas urgent',
        body: `Un animal ${urgency === 'critical' ? 'en danger critique' : 'en détresse'} près de chez vous.`,
        data: { report_id, urgency },
      });

      // Send FCM push if token available
      if (vol.fcm_token && fcmKey) {
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: vol.fcm_token,
            notification: {
              title: '🆘 Cas urgent RNSA',
              body: `Intervention requise dans votre secteur. Urgence: ${urgency}`,
              sound: 'default',
            },
            data: { report_id, type: 'new_case', urgency },
            priority: urgency === 'critical' ? 'high' : 'normal',
          }),
        });
      }
    });

    await Promise.allSettled(notifyPromises);

    return new Response(
      JSON.stringify({ success: true, volunteers_notified: Math.min(matched.length, 3) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
