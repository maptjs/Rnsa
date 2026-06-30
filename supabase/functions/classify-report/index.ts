import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { report_id, image_base64 } = await req.json();
    if (!report_id) throw new Error('report_id required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Update report status to ai_processing
    await supabase.from('reports').update({ status: 'ai_processing' }).eq('id', report_id);

    let ai_urgency_score = 0.5;
    let ai_animal_type = 'unknown';

    if (image_base64 && Deno.env.get('OPENAI_API_KEY')) {
      // Call OpenAI Vision API
      const visionRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${image_base64}` },
              },
              {
                type: 'text',
                text: 'Analyze this stray animal photo. Return JSON only: { "urgency": "low|medium|high|critical", "confidence": 0.0-1.0, "animal_type": "dog|cat|horse|bird|unknown", "injury_visible": true|false, "notes": "brief observation" }',
              },
            ],
          }],
        }),
      });

      if (visionRes.ok) {
        const visionData = await visionRes.json();
        const content = visionData.choices?.[0]?.message?.content || '{}';
        const clean = content.replace(/```json|```/g, '').trim();
        try {
          const parsed = JSON.parse(clean);
          const urgencyMap: Record<string, number> = { critical: 0.95, high: 0.75, medium: 0.5, low: 0.25 };
          ai_urgency_score = urgencyMap[parsed.urgency] ?? 0.5;
          ai_animal_type = parsed.animal_type ?? 'unknown';
        } catch {
          // fallback to defaults
        }
      }
    }

    // Update report with AI results
    const urgencyFromScore =
      ai_urgency_score >= 0.85 ? 'critical' :
      ai_urgency_score >= 0.65 ? 'high' :
      ai_urgency_score >= 0.4 ? 'medium' : 'low';

    await supabase.from('reports').update({
      ai_urgency_score,
      ai_animal_type,
      urgency: urgencyFromScore,
      status: 'new',
    }).eq('id', report_id);

    // Trigger volunteer matching
    const reportRes = await supabase.from('reports').select('location, urgency').eq('id', report_id).single();
    if (reportRes.data) {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/match-volunteers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report_id, urgency: urgencyFromScore }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, ai_urgency_score, ai_animal_type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
