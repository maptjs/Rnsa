'use client';

import { useState, useEffect } from 'react';
import { MOCK_HOTSPOTS } from '@/lib/mock-data';
import { riskScoreColor, riskScoreLabel, formatDate } from '@/lib/utils';

export default function HotspotsPage() {
  const [mounted, setMounted] = useState(false);
  const sortedHotspots = [...MOCK_HOTSPOTS].sort((a, b) => b.risk_score - a.risk_score);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      const el = document.getElementById('hotspot-map') as HTMLElement & { _leaflet_id?: number };
      if (el._leaflet_id) return;

      const map = L.map('hotspot-map', {
        center: [31.7917, -7.0926],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      MOCK_HOTSPOTS.forEach((hotspot) => {
        const color = riskScoreColor(hotspot.risk_score);
        const opacity = 0.1 + hotspot.risk_score * 0.25;

        L.circle([hotspot.center.lat, hotspot.center.lng], {
          radius: hotspot.radius_meters,
          color,
          fillColor: color,
          fillOpacity: opacity,
          weight: 2,
          dashArray: '6 4',
        }).addTo(map);

        L.circle([hotspot.center.lat, hotspot.center.lng], {
          radius: hotspot.radius_meters * 2,
          color,
          fillColor: color,
          fillOpacity: opacity * 0.3,
          weight: 0.5,
          dashArray: '3 6',
        }).addTo(map);

        const icon = L.divIcon({
          html: `<div style="
            background:${color}30;
            border:1.5px solid ${color};
            border-radius:50%;
            width:40px;height:40px;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;
          ">🔥</div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        L.marker([hotspot.center.lat, hotspot.center.lng], { icon })
          .bindPopup(`<div style="color:#F5F5F2">
            <strong>${hotspot.district}, ${hotspot.city}</strong><br/>
            <span style="color:#FF8A50">Risque: ${Math.round(hotspot.risk_score * 100)}%</span><br/>
            <small style="color:#9B9B96">${hotspot.trigger_reason}</small>
          </div>`)
          .addTo(map);
      });
    };

    initMap();
  }, [mounted]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Moteur prédictif</h1>
        <p className="text-brand-gray-light text-sm mt-1">
          Points chauds anticipés — Analyse des patterns temporels et spatiaux
        </p>
      </div>

      {/* Algorithm explanation */}
      <div className="bg-brand-red/5 border border-brand-red/20 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">🧠</span>
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Comment fonctionne le moteur prédictif</h2>
            <p className="text-sm text-brand-gray-light">
              L&apos;algorithme analyse 12 mois d&apos;historique de signalements, groupés par (ville, district, jour de semaine, semaine de l&apos;année).
              Il identifie les dates où le volume prédit dépasse 2x la moyenne historique.
              Les facteurs déclencheurs incluent : post-Aïd Al-Adha, pics ramadanesques, périodes touristiques, fins de mois difficiles.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-brand-dark-2 border border-white/5 rounded-2xl overflow-hidden" style={{ height: 480 }}>
            <div id="hotspot-map" style={{ height: '100%' }} />
          </div>
        </div>

        {/* Hotspot list */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-4">
            Zones à risque — {sortedHotspots.length} détectées
          </h2>
          <div className="space-y-3">
            {sortedHotspots.map((hotspot, i) => {
              const color = riskScoreColor(hotspot.risk_score);
              return (
                <div
                  key={hotspot.id}
                  className="bg-brand-dark-2 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
                  style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{hotspot.district}</h3>
                      <p className="text-xs text-brand-gray-light">{hotspot.city}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color }}>
                        {Math.round(hotspot.risk_score * 100)}%
                      </div>
                      <div className="text-[10px]" style={{ color }}>
                        {riskScoreLabel(hotspot.risk_score)}
                      </div>
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div className="w-full bg-white/5 rounded-full h-1 mb-3">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{ width: `${hotspot.risk_score * 100}%`, background: color }}
                    />
                  </div>

                  <p className="text-xs text-brand-gray-light mb-2">{hotspot.trigger_reason}</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-gray">Prévu pour</span>
                    <span className="text-white">{formatDate(hotspot.predicted_for)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1">
                    <span className="text-brand-gray">Rayon de risque</span>
                    <span className="text-white">{hotspot.radius_meters}m</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dead zone alert */}
          <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>📡</span>
              <span className="text-sm font-semibold text-white">Radar zones mortes</span>
            </div>
            <p className="text-xs text-brand-gray-light">
              Scan PostGIS toutes les 6h sur une grille de 10km.
              3 zones sans bénévoles détectées actuellement.
            </p>
            <div className="mt-3 space-y-1.5">
              {['Errachidia', 'Tan-Tan', 'Zagora'].map((city) => (
                <div key={city} className="flex items-center justify-between text-xs">
                  <span className="text-blue-400">⚠ {city}</span>
                  <span className="text-brand-gray">0 bénévole dans 20km</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
