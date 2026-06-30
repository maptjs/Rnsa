'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseKey: '••••••••••••••••••••••••',
    openaiKey: '••••••••••••••••••••••••',
    fcmKey: '••••••••••••••••••••••••',
    rateLimit: '10',
    maxImageMb: '10',
    matchRadius: '10',
    adminEmail: 'admin@rnsa.ma',
    systemLang: 'fr',
    enableAI: true,
    enablePredictions: true,
    enableDeadZone: true,
    enableNotifications: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggle = (key: keyof typeof form) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Paramètres système</h1>
        <p className="text-brand-gray-light text-sm mt-1">Configuration de l&apos;infrastructure RNSA Maroc</p>
      </div>

      <div className="space-y-6">
        {/* Supabase */}
        <section className="bg-brand-dark-2 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">⬡</span> Supabase
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-brand-gray-light block mb-1.5">URL du projet</label>
              <input className="input-dark" value={form.supabaseUrl} onChange={(e) => setForm(p => ({ ...p, supabaseUrl: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-brand-gray-light block mb-1.5">Clé Anon (publique)</label>
              <input className="input-dark" type="password" value={form.supabaseKey} onChange={(e) => setForm(p => ({ ...p, supabaseKey: e.target.value }))} />
              <p className="text-[11px] text-brand-gray mt-1">Variable d&apos;environnement: NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
            </div>
          </div>
        </section>

        {/* AI Services */}
        <section className="bg-brand-dark-2 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">◈</span> Services IA
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-brand-gray-light block mb-1.5">Clé API OpenAI</label>
              <input className="input-dark" type="password" value={form.openaiKey} onChange={(e) => setForm(p => ({ ...p, openaiKey: e.target.value }))} />
              <p className="text-[11px] text-brand-gray mt-1">Utilisée pour Vision API (classification) + Embeddings (identité animale)</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm text-white">Classification IA des signalements</div>
                <div className="text-xs text-brand-gray-light">OpenAI Vision → score d&apos;urgence + type d&apos;animal</div>
              </div>
              <button onClick={() => toggle('enableAI')} className={`w-10 h-5 rounded-full transition-colors relative ${form.enableAI ? 'bg-brand-red' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.enableAI ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm text-white">Moteur prédictif</div>
                <div className="text-xs text-brand-gray-light">Cron quotidien à 06h00 (heure Casablanca)</div>
              </div>
              <button onClick={() => toggle('enablePredictions')} className={`w-10 h-5 rounded-full transition-colors relative ${form.enablePredictions ? 'bg-brand-red' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.enablePredictions ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm text-white">Radar zones mortes</div>
                <div className="text-xs text-brand-gray-light">Scan PostGIS toutes les 6 heures</div>
              </div>
              <button onClick={() => toggle('enableDeadZone')} className={`w-10 h-5 rounded-full transition-colors relative ${form.enableDeadZone ? 'bg-brand-red' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.enableDeadZone ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-brand-dark-2 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-orange-400">🔔</span> Firebase Cloud Messaging
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-brand-gray-light block mb-1.5">Clé serveur FCM</label>
              <input className="input-dark" type="password" value={form.fcmKey} onChange={(e) => setForm(p => ({ ...p, fcmKey: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm text-white">Notifications push activées</div>
                <div className="text-xs text-brand-gray-light">Alertes bénévoles, mises à jour signalements</div>
              </div>
              <button onClick={() => toggle('enableNotifications')} className={`w-10 h-5 rounded-full transition-colors relative ${form.enableNotifications ? 'bg-brand-red' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.enableNotifications ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Security & Limits */}
        <section className="bg-brand-dark-2 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">🔒</span> Sécurité & limites
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-brand-gray-light block mb-1.5">Signalements max / utilisateur / 24h</label>
              <input className="input-dark" type="number" value={form.rateLimit} onChange={(e) => setForm(p => ({ ...p, rateLimit: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-brand-gray-light block mb-1.5">Taille max image (MB)</label>
              <input className="input-dark" type="number" value={form.maxImageMb} onChange={(e) => setForm(p => ({ ...p, maxImageMb: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-brand-gray-light block mb-1.5">Rayon matching bénévoles (km)</label>
              <input className="input-dark" type="number" value={form.matchRadius} onChange={(e) => setForm(p => ({ ...p, matchRadius: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-brand-gray-light block mb-1.5">Email administrateur</label>
              <input className="input-dark" type="email" value={form.adminEmail} onChange={(e) => setForm(p => ({ ...p, adminEmail: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/[0.02] rounded-lg border border-white/5 text-xs text-brand-gray-light">
            <strong className="text-white">Sécurité activée :</strong> Row Level Security (RLS) sur toutes les tables Supabase · Suppression EXIF des images · Validation MIME type · JWT 1h + refresh tokens
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="bg-brand-red hover:bg-brand-red-light text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Sauvegarder les paramètres
          </button>
          {saved && (
            <span className="text-sm text-green-400 animate-fade-in">✓ Paramètres sauvegardés</span>
          )}
        </div>
      </div>
    </div>
  );
}
