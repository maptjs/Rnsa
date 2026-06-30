import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Runs daily at 06:00 Casablanca time via Supabase cron
// Schedule: 0 5 * * * (UTC = Casablanca -1h in winter, same in summer)

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Get all reports from last 12 months grouped by district/city/day_of_week
    const { data: reports, error } = await supabase
      .from('reports')
      .select('city, district, created_at, location')
      .gte('created_at', oneYearAgo.toISOString())
      .not('city', 'is', null);

    if (error) throw error;

    // Group by (city, district, week_of_year)
    const grouped: Record<string, { count: number; weeks: Record<number, number>; locations: number[][] }> = {};

    for (const r of reports || []) {
      const key = `${r.city}|${r.district || 'unknown'}`;
      const date = new Date(r.created_at);
      const weekOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

      if (!grouped[key]) grouped[key] = { count: 0, weeks: {}, locations: [] };
      grouped[key].count++;
      grouped[key].weeks[weekOfYear] = (grouped[key].weeks[weekOfYear] || 0) + 1;
    }

    // Current week of year
    const currentWeek = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const nextWeek = (currentWeek + 1) % 52;

    const hotspots: Array<{
      city: string;
      district: string;
      risk_score: number;
      trigger_reason: string;
      predicted_for: string;
    }> = [];

    for (const [key, data] of Object.entries(grouped)) {
      const [city, district] = key.split('|');
      const weeklyAvg = data.count / 52;
      const nextWeekHistoric = data.weeks[nextWeek] || 0;

      // Flag if next week's historic count > 2x weekly average
      if (nextWeekHistoric > weeklyAvg * 2 && nextWeekHistoric >= 3) {
        const risk_score = Math.min(0.99, nextWeekHistoric / (weeklyAvg * 3));

        // Determine trigger reason based on week
        let trigger_reason = 'Pic historique détecté';
        const month = today.getMonth();
        if (month === 6 || month === 7) trigger_reason = 'Pic post-Aïd Al-Adha — abandons saisonniers';
        else if (month === 2) trigger_reason = 'Période Ramadan — affluence animaux errants';
        else if (month === 11 || month === 0) trigger_reason = 'Saison touristique hivernale';
        else trigger_reason = `Tendance historique semaine ${nextWeek}`;

        const predicted_for = new Date(today);
        predicted_for.setDate(predicted_for.getDate() + 7);

        hotspots.push({ city, district, risk_score, trigger_reason, predicted_for: predicted_for.toISOString().split('T')[0] });
      }
    }

    // Upsert hotspots (clear old predictions for same districts)
    if (hotspots.length > 0) {
      // Delete old predictions for these districts
      for (const h of hotspots) {
        await supabase.from('predicted_hotspots')
          .delete()
          .eq('city', h.city)
          .eq('district', h.district)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      }

      // Insert new predictions (using city center coordinates as approximation)
      const cityCoords: Record<string, [number, number]> = {
        'Casablanca': [33.5731, -7.5898],
        'Rabat': [34.0209, -6.8416],
        'Marrakech': [31.6295, -7.9811],
        'Fès': [34.0181, -5.0078],
        'Tanger': [35.7673, -5.7998],
        'Agadir': [30.4278, -9.5981],
        'Meknès': [33.8935, -5.5547],
        'Oujda': [34.6867, -1.9114],
      };

      for (const h of hotspots) {
        const coords = cityCoords[h.city] || [31.7917, -7.0926];
        await supabase.from('predicted_hotspots').insert({
          ...h,
          center: `POINT(${coords[1]} ${coords[0]})`,
          radius_meters: Math.round(500 + h.risk_score * 1000),
        });
      }

      // Notify volunteers in affected zones
      for (const h of hotspots.filter(h => h.risk_score >= 0.7)) {
        const { data: volunteers } = await supabase
          .from('profiles')
          .select('id, city')
          .eq('city', h.city)
          .in('role', ['volunteer', 'steward'])
          .eq('is_available', true);

        for (const vol of volunteers || []) {
          await supabase.from('notifications').insert({
            user_id: vol.id,
            type: 'predicted_hotspot',
            title: '🔥 Zone à risque prédite',
            body: `Affluence prévue cette semaine: ${h.district}, ${h.city}. ${h.trigger_reason}`,
            data: { city: h.city, district: h.district, risk_score: h.risk_score },
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, hotspots_generated: hotspots.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
