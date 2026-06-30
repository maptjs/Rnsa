import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Runs every 6 hours via Supabase cron: 0 */6 * * *

// Morocco bounding box
const MOROCCO_BOUNDS = {
  minLat: 27.6, maxLat: 35.9,
  minLng: -13.2, maxLng: -1.1,
};
const GRID_SIZE_KM = 20;
const LAT_PER_KM = 1 / 111;
const LNG_PER_KM = 1 / 85; // approximate at Morocco latitude

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all active volunteers with location
    const { data: volunteers, error: volErr } = await supabase
      .from('profiles')
      .select('id, location, city, fcm_token')
      .in('role', ['volunteer', 'steward', 'vet'])
      .eq('is_available', true)
      .not('location', 'is', null);

    if (volErr) throw volErr;

    const volList = volunteers || [];

    // Build grid over Morocco
    const deadZones: Array<{ lat: number; lng: number; city?: string }> = [];
    const latStep = LAT_PER_KM * GRID_SIZE_KM;
    const lngStep = LNG_PER_KM * GRID_SIZE_KM;

    for (let lat = MOROCCO_BOUNDS.minLat; lat < MOROCCO_BOUNDS.maxLat; lat += latStep) {
      for (let lng = MOROCCO_BOUNDS.minLng; lng < MOROCCO_BOUNDS.maxLng; lng += lngStep) {
        // Count volunteers within GRID_SIZE_KM of this cell center
        const cellLat = lat + latStep / 2;
        const cellLng = lng + lngStep / 2;

        const nearbyVols = volList.filter((v) => {
          if (!v.location) return false;
          // Simple distance approximation
          const dlat = (v.location.coordinates?.[1] || 0) - cellLat;
          const dlng = (v.location.coordinates?.[0] || 0) - cellLng;
          const distKm = Math.sqrt((dlat / LAT_PER_KM) ** 2 + (dlng / LNG_PER_KM) ** 2);
          return distKm <= GRID_SIZE_KM;
        });

        if (nearbyVols.length === 0) {
          deadZones.push({ lat: cellLat, lng: cellLng });
        }
      }
    }

    // Get citizens in dead zones (no volunteers nearby)
    // Find citizens who live in cities that are in dead zones
    const { data: citizens, error: citErr } = await supabase
      .from('profiles')
      .select('id, city, fcm_token')
      .eq('role', 'citizen')
      .not('city', 'is', null)
      .limit(100); // batch limit

    if (citErr) throw citErr;

    // Moroccan cities known to often be dead zones
    const deadZoneCities = new Set<string>();
    const cityList = ['Errachidia', 'Zagora', 'Tan-Tan', 'Guelmim', 'Midelt', 'Ifrane', 'Azilal', 'Tarfaya'];

    for (const city of cityList) {
      const cityVols = volList.filter((v) => v.city === city);
      if (cityVols.length === 0) deadZoneCities.add(city);
    }

    // Send recruitment notifications to citizens in dead zones
    let notificationsSent = 0;
    for (const citizen of citizens || []) {
      if (citizen.city && deadZoneCities.has(citizen.city)) {
        await supabase.from('notifications').insert({
          user_id: citizen.id,
          type: 'dead_zone_alert',
          title: '📡 Votre quartier a besoin de vous',
          body: `${citizen.city} n'a aucun bénévole actif dans un rayon de 20km. Rejoignez le réseau RNSA.`,
          data: { city: citizen.city, dead_zone: true },
        });
        notificationsSent++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dead_zones_detected: deadZones.length,
        dead_zone_cities: Array.from(deadZoneCities),
        notifications_sent: notificationsSent,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
