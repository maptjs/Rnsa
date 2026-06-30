import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const municipality = url.searchParams.get('municipality');
    const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get('end_date') || new Date().toISOString();

    // Validate API key
    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify subscription
    const { data: sub, error: subErr } = await supabase
      .from('municipality_subscriptions')
      .select('*')
      .eq('api_key', apiKey)
      .eq('active', true)
      .single();

    if (subErr || !sub) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive API key' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const targetCity = municipality || sub.municipality;

    // Fetch reports for this municipality
    const { data: reports, error: repErr } = await supabase
      .from('reports')
      .select('id, urgency, status, created_at, updated_at, ai_animal_type, district')
      .eq('city', targetCity)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (repErr) throw repErr;

    const total = reports?.length || 0;
    const resolved = reports?.filter(r => ['rescued', 'closed'].includes(r.status)).length || 0;

    // Average response time (updated_at - created_at for resolved)
    const resolvedReports = reports?.filter(r => r.status === 'rescued' || r.status === 'closed') || [];
    const avgResponseMs = resolvedReports.length > 0
      ? resolvedReports.reduce((acc, r) => {
          const ms = new Date(r.updated_at).getTime() - new Date(r.created_at).getTime();
          return acc + ms;
        }, 0) / resolvedReports.length
      : 0;

    // Group by district
    const districtCounts: Record<string, number> = {};
    for (const r of reports || []) {
      if (r.district) districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
    }
    const hotspot_districts = Object.entries(districtCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([district]) => district);

    // Animal type counts
    const typeCounts: Record<string, number> = {};
    for (const r of reports || []) {
      if (r.ai_animal_type) typeCounts[r.ai_animal_type] = (typeCounts[r.ai_animal_type] || 0) + 1;
    }
    const top_animal_types = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    // Monthly trend
    const monthlyMap: Record<string, number> = {};
    for (const r of reports || []) {
      const month = r.created_at.slice(0, 7);
      monthlyMap[month] = (monthlyMap[month] || 0) + 1;
    }
    const monthly_trend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    const stats = {
      municipality: targetCity,
      period: { start: startDate, end: endDate },
      total_reports: total,
      resolved_rate: total > 0 ? Math.round((resolved / total) * 1000) / 1000 : 0,
      avg_response_time_minutes: Math.round(avgResponseMs / 60000),
      hotspot_districts,
      top_animal_types,
      monthly_trend,
      estimated_stray_population: Math.round(total * 6.8), // empirical multiplier
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
