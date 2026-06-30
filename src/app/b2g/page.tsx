'use client';

import { useState } from 'react';
import { generateApiKey } from '@/lib/utils';

const MUNICIPALITIES = [
  { name: 'Casablanca', region: 'Grand Casablanca-Settat', plan: 'enterprise', active: true, reports: 412, rate: 88 },
  { name: 'Rabat', region: 'Rabat-Salé-Kénitra', plan: 'pro', active: true, reports: 198, rate: 91 },
  { name: 'Marrakech', region: 'Marrakech-Safi', plan: 'pro', active: true, reports: 187, rate: 85 },
  { name: 'Fès', region: 'Fès-Meknès', plan: 'basic', active: true, reports: 143, rate: 79 },
  { name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', plan: 'basic', active: false, reports: 112, rate: 74 },
];

const SAMPLE_RESPONSE = {
  total_reports: 412,
  resolved_rate: 0.88,
  avg_response_time_minutes: 16,
  hotspot_districts: ['Hay Mohammadi', 'Sidi Moumen', 'Hay Hassani'],
  top_animal_types: [{ type: 'dog', count: 287 }, { type: 'cat', count: 125 }],
  monthly_trend: [{ month: '2024-10', count: 38 }, { month: '2024-11', count: 45 }],
  estimated_stray_population: 2840,
};

export default function B2GPage() {
  const [newKey, setNewKey] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  const handleGenerate = () => {
    setNewKey(generateApiKey());
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">API Gouvernement (B2G)</h1>
        <p className="text-brand-gray-light text-sm mt-1">
          Infrastructure de données pour les municipalités marocaines
        </p>
      </div>

      {/* Value prop */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: '🗺️', title: 'Densité animale', desc: 'Cartes GeoJSON par district, mis à jour quotidiennement' },
          { icon: '🦠', title: 'Risques sanitaires', desc: 'Zones de vecteurs de maladies, alertes épidémiologiques' },
          { icon: '📊', title: 'Analytics coût', desc: 'Coût par intervention, temps de réponse, benchmarks nationaux' },
        ].map((item) => (
          <div key={item.title} className="bg-brand-dark-2 border border-white/5 rounded-2xl p-5">
            <span className="text-2xl">{item.icon}</span>
            <h3 className="text-sm font-semibold text-white mt-3 mb-1">{item.title}</h3>
            <p className="text-xs text-brand-gray-light">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Municipality subscriptions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Abonnements municipalités</h2>
            <div className="flex gap-2 text-xs text-brand-gray-light">
              <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full">{MUNICIPALITIES.filter(m => m.active).length} actifs</span>
            </div>
          </div>
          <div className="space-y-3">
            {MUNICIPALITIES.map((muni) => (
              <div
                key={muni.name}
                className="bg-brand-dark-2 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedMuni(muni.name)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{muni.name}</h3>
                    <p className="text-xs text-brand-gray-light">{muni.region}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      muni.plan === 'enterprise' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' :
                      muni.plan === 'pro' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                      'bg-white/5 text-brand-gray border-white/10'
                    }`}>
                      {muni.plan.toUpperCase()}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${muni.active ? 'bg-green-400' : 'bg-brand-gray'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-brand-gray-light">
                  <span>{muni.reports} signalements</span>
                  <span className="text-green-400">{muni.rate}% résolution</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mt-6 bg-brand-dark-2 border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Tarifs B2G (MAD/mois)</h3>
            <div className="space-y-3">
              {[
                { plan: 'Basic', price: '2 500', features: ['Données agrégées', 'Export CSV mensuel', '1 utilisateur'] },
                { plan: 'Pro', price: '7 500', features: ['API temps réel', 'GeoJSON + heatmaps', '5 utilisateurs', 'Tableau de bord dédié'] },
                { plan: 'Enterprise', price: '15 000', features: ['API illimitée', 'Données brutes anonymisées', 'SLA 99.9%', 'Support dédié', 'Intégration SI municipal'] },
              ].map((tier) => (
                <div key={tier.plan} className={`p-4 rounded-xl border ${
                  tier.plan === 'Enterprise' ? 'border-brand-gold/30 bg-brand-gold/5' : 'border-white/5'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{tier.plan}</span>
                    <span className="text-sm font-semibold text-brand-gold">{tier.price} MAD</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tier.features.map((f) => (
                      <span key={f} className="text-[10px] text-brand-gray-light bg-white/5 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Key management + sample */}
        <div className="space-y-6">
          {/* Key generator */}
          <div className="bg-brand-dark-2 border border-white/5 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Gestion des clés API</h2>
            <div className="space-y-3">
              <select
                value={selectedMuni}
                onChange={(e) => setSelectedMuni(e.target.value)}
                className="input-dark"
              >
                <option value="">Sélectionner une municipalité</option>
                {MUNICIPALITIES.map((m) => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                disabled={!selectedMuni}
                className="w-full bg-brand-red hover:bg-brand-red-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Générer une nouvelle clé API
              </button>
              {newKey && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[10px] text-brand-gray-light mb-1">Nouvelle clé (copiez-la maintenant)</p>
                  <code className="text-xs text-green-400 break-all font-mono">{newKey}</code>
                </div>
              )}
            </div>
          </div>

          {/* API reference */}
          <div className="bg-brand-dark-2 border border-white/5 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Référence API</h2>
            <div className="space-y-3">
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono bg-green-900/40 text-green-400 px-2 py-0.5 rounded">GET</span>
                  <code className="text-xs text-white font-mono">/api/b2g/municipality-stats</code>
                </div>
                <p className="text-xs text-brand-gray-light">Statistiques agrégées par municipalité et période</p>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded">Headers</span>
                </div>
                <code className="text-xs text-brand-gray-light font-mono">Authorization: Bearer {'<API_KEY>'}</code>
              </div>
            </div>

            <button
              onClick={() => setShowResponse(!showResponse)}
              className="mt-4 w-full text-xs text-brand-gray-light hover:text-white border border-white/5 hover:border-white/10 rounded-lg py-2 transition-colors"
            >
              {showResponse ? '▲ Masquer' : '▼ Voir'} exemple de réponse
            </button>

            {showResponse && (
              <div className="mt-3 p-3 bg-black/40 rounded-lg border border-white/5 overflow-auto max-h-64">
                <pre className="text-[11px] text-green-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(SAMPLE_RESPONSE, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Edge Function info */}
          <div className="bg-brand-dark-2 border border-white/5 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Infrastructure Supabase</h2>
            <div className="space-y-2 text-xs">
              {[
                { name: 'classify-report', status: 'active', calls: '1,247' },
                { name: 'match-volunteers', status: 'active', calls: '986' },
                { name: 'accept-intervention', status: 'active', calls: '312' },
                { name: 'identify-animal', status: 'active', calls: '834' },
                { name: 'predict-hotspots', status: 'cron', calls: '365' },
                { name: 'scan-dead-zones', status: 'cron', calls: '1,460' },
                { name: 'b2g-stats', status: 'active', calls: '48' },
              ].map((fn) => (
                <div key={fn.name} className="flex items-center justify-between py-1.5 border-b border-white/[0.03]">
                  <span className="font-mono text-brand-gray-light">{fn.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                      fn.status === 'cron' ? 'bg-blue-900/30 text-blue-400' : 'bg-green-900/30 text-green-400'
                    }`}>{fn.status}</span>
                    <span className="text-brand-gray">{fn.calls} appels</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
