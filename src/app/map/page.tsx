'use client';

import { useEffect, useState } from 'react';
import { MOCK_REPORTS, MOCK_HOTSPOTS, MOCK_ZONES } from '@/lib/mock-data';
import { urgencyLabel, riskScoreLabel, riskScoreColor } from '@/lib/utils';
import type { Report, PredictedHotspot } from '@/types';

type LayerType = 'reports' | 'hotspots' | 'zones';

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [activeLayers, setActiveLayers] = useState<LayerType[]>(['reports', 'hotspots']);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<PredictedHotspot | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      const existingMap = document.getElementById('map') as HTMLElement & { _leaflet_id?: number };
      if (existingMap._leaflet_id) return;

      const map = L.map('map', {
        center: [31.7917, -7.0926],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Report markers
      if (activeLayers.includes('reports')) {
        MOCK_REPORTS.forEach((report) => {
          const colors: Record<string, string> = {
            critical: '#1a1a18',
            high: '#C1121F',
            medium: '#E65100',
            low: '#2E7D32',
          };
          const color = colors[report.urgency] || '#C1121F';

          const icon = L.divIcon({
            html: `<div style="
              width:14px;height:14px;
              border-radius:50%;
              background:${color};
              border:2px solid rgba(255,255,255,0.3);
              box-shadow:0 0 8px ${color}80;
              ${report.urgency === 'critical' ? 'animation:markerPulse 1.5s infinite' : ''}
            "></div>`,
            className: '',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const marker = L.marker([report.location.lat, report.location.lng], { icon }).addTo(map);
          marker.on('click', () => {
            setSelectedReport(report);
            setSelectedHotspot(null);
          });
        });
      }

      // Hotspot circles
      if (activeLayers.includes('hotspots')) {
        MOCK_HOTSPOTS.forEach((hotspot) => {
          const color = riskScoreColor(hotspot.risk_score);
          L.circle([hotspot.center.lat, hotspot.center.lng], {
            radius: hotspot.radius_meters,
            color: color,
            fillColor: color,
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '6 4',
          }).addTo(map);

          const icon = L.divIcon({
            html: `<div style="
              font-size:18px;
              filter:drop-shadow(0 0 4px ${color});
            ">🔥</div>`,
            className: '',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          const marker = L.marker([hotspot.center.lat, hotspot.center.lng], { icon }).addTo(map);
          marker.on('click', () => {
            setSelectedHotspot(hotspot);
            setSelectedReport(null);
          });
        });
      }

      // Stewardship zones
      if (activeLayers.includes('zones')) {
        MOCK_ZONES.forEach((zone) => {
          L.circle([zone.center.lat, zone.center.lng], {
            radius: zone.radius_meters,
            color: '#C9A84C',
            fillColor: '#C9A84C',
            fillOpacity: 0.08,
            weight: 1,
            dashArray: '4 4',
          }).addTo(map);
        });
      }
    };

    initMap();
  }, [mounted, activeLayers]);

  const toggleLayer = (layer: LayerType) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  return (
    <div className="relative h-screen flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-white/5 bg-brand-dark-2 flex items-center justify-between z-10 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-white">Carte nationale</h1>
          <p className="text-xs text-brand-gray-light">{MOCK_REPORTS.length} signalements · {MOCK_HOTSPOTS.length} zones à risque</p>
        </div>
        <div className="flex items-center gap-2">
          {([
            { key: 'reports' as LayerType, label: 'Signalements', color: 'border-brand-red text-brand-red' },
            { key: 'hotspots' as LayerType, label: 'Points chauds', color: 'border-orange-500 text-orange-400' },
            { key: 'zones' as LayerType, label: 'Zones gardiens', color: 'border-yellow-500 text-yellow-400' },
          ]).map((layer) => (
            <button
              key={layer.key}
              onClick={() => toggleLayer(layer.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeLayers.includes(layer.key)
                  ? `${layer.color} bg-white/5`
                  : 'border-white/10 text-brand-gray hover:text-white'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div className="relative flex-1">
        <div id="map" className="absolute inset-0" style={{ zIndex: 1 }} />

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-brand-dark-2/90 backdrop-blur border border-white/10 rounded-xl p-4 text-xs space-y-2 z-10">
          <div className="text-brand-gray-light font-medium mb-2">Urgence</div>
          {[
            { color: '#1a1a18', border: '1px solid #555', label: 'Critique' },
            { color: '#C1121F', label: 'Élevée' },
            { color: '#E65100', label: 'Moyenne' },
            { color: '#2E7D32', label: 'Faible' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: item.color, border: item.border }}
              />
              <span className="text-brand-gray-light">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {[
            { value: MOCK_REPORTS.filter(r => r.status === 'new' || r.status === 'assigned').length, label: 'Actifs', color: 'text-red-400' },
            { value: MOCK_HOTSPOTS.length, label: 'Zones risque', color: 'text-orange-400' },
            { value: MOCK_ZONES.length, label: 'Zones gardées', color: 'text-yellow-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-brand-dark-2/90 backdrop-blur border border-white/10 rounded-xl px-4 py-2 text-right">
              <div className={`text-xl font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-brand-gray-light">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Report detail panel */}
        {selectedReport && (
          <div className="absolute bottom-6 right-6 bg-brand-dark-2/95 backdrop-blur border border-white/10 rounded-2xl p-5 w-72 z-10 animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedReport.title}</h3>
                <p className="text-xs text-brand-gray-light mt-0.5">{selectedReport.city} · {selectedReport.district}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-brand-gray hover:text-white text-lg leading-none">×</button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                selectedReport.urgency === 'critical' ? 'bg-gray-800 text-gray-200 border-gray-600' :
                selectedReport.urgency === 'high' ? 'bg-red-900/50 text-red-300 border-red-700' :
                selectedReport.urgency === 'medium' ? 'bg-orange-900/50 text-orange-300 border-orange-700' :
                'bg-green-900/50 text-green-300 border-green-700'
              }`}>
                {urgencyLabel(selectedReport.urgency)}
              </span>
              {selectedReport.ai_urgency_score && (
                <span className="text-[10px] text-brand-gray">IA: {Math.round(selectedReport.ai_urgency_score * 100)}%</span>
              )}
            </div>
            {selectedReport.description && (
              <p className="text-xs text-brand-gray-light mb-3 line-clamp-2">{selectedReport.description}</p>
            )}
            <a
              href={`/reports`}
              className="block w-full text-center bg-brand-red hover:bg-brand-red-light text-white text-xs font-medium py-2 rounded-lg transition-colors"
            >
              Voir le détail →
            </a>
          </div>
        )}

        {/* Hotspot detail panel */}
        {selectedHotspot && (
          <div className="absolute bottom-6 right-6 bg-brand-dark-2/95 backdrop-blur border border-orange-500/20 rounded-2xl p-5 w-72 z-10 animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">🔥 {selectedHotspot.district}</h3>
                <p className="text-xs text-brand-gray-light mt-0.5">{selectedHotspot.city}</p>
              </div>
              <button onClick={() => setSelectedHotspot(null)} className="text-brand-gray hover:text-white text-lg leading-none">×</button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                style={{
                  background: riskScoreColor(selectedHotspot.risk_score) + '20',
                  color: riskScoreColor(selectedHotspot.risk_score),
                  borderColor: riskScoreColor(selectedHotspot.risk_score) + '40',
                }}
              >
                Risque {riskScoreLabel(selectedHotspot.risk_score)}
              </span>
              <span className="text-[10px] text-brand-gray">{Math.round(selectedHotspot.risk_score * 100)}%</span>
            </div>
            <p className="text-xs text-brand-gray-light mb-3">{selectedHotspot.trigger_reason}</p>
            <p className="text-[11px] text-brand-gray">
              Prévu pour le {new Date(selectedHotspot.predicted_for).toLocaleDateString('fr-MA')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
