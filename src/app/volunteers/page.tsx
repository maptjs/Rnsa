'use client';

import { MOCK_PROFILES } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

const VOLUNTEERS = [
  ...MOCK_PROFILES,
  {
    id: 'user-4',
    full_name: 'Omar Tazi',
    phone: '+212664567890',
    role: 'volunteer' as const,
    city: 'Tanger',
    avatar_url: null,
    fcm_token: null,
    reputation_score: 95,
    is_available: true,
    location: { lat: 35.7673, lng: -5.7998 },
    created_at: '2024-07-20T12:00:00Z',
  },
  {
    id: 'user-5',
    full_name: 'Nadia Berrada',
    phone: '+212665678901',
    role: 'volunteer' as const,
    city: 'Agadir',
    avatar_url: null,
    fcm_token: null,
    reputation_score: 175,
    is_available: false,
    location: { lat: 30.4278, lng: -9.5981 },
    created_at: '2024-04-01T09:00:00Z',
  },
];

const BADGES = [
  { icon: '🏅', name: 'Premier Secours', desc: 'Première intervention' },
  { icon: '🛡️', name: 'Gardien de Zone', desc: 'Tutelle de zone active' },
  { icon: '🔍', name: 'Détective', desc: 'Identité animale trouvée' },
  { icon: '💪', name: 'Sauveur', desc: '10 sauvetages' },
  { icon: '⭐', name: 'Héros National', desc: '50 sauvetages' },
  { icon: '🌍', name: 'Sans Frontières', desc: '3+ villes différentes' },
  { icon: '🤝', name: 'Réseau', desc: '5 bénévoles parrainés' },
  { icon: '🌙', name: 'Nuit Blanche', desc: 'Sauvetage de nuit' },
  { icon: '🎖️', name: 'Vétéran', desc: 'Actif depuis 1 an' },
];

export default function VolunteersPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bénévoles</h1>
          <p className="text-brand-gray-light text-sm mt-1">312 inscrits · 87 actifs en ce moment</p>
        </div>
        <button className="bg-brand-red hover:bg-brand-red-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Inviter un bénévole
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total inscrits', value: '312', color: 'text-white' },
          { label: 'Actifs aujourd\'hui', value: '87', color: 'text-green-400' },
          { label: 'Score moyen', value: '198', color: 'text-brand-gold' },
          { label: 'Villes couvertes', value: '24', color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="text-xs text-brand-gray-light mb-2">{s.label}</div>
            <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volunteer list */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-4">Classement bénévoles</h2>
          <div className="space-y-3">
            {VOLUNTEERS.sort((a, b) => b.reputation_score - a.reputation_score).map((v, i) => (
              <div key={v.id} className="bg-brand-dark-2 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-brand-gold/20 text-brand-gold' :
                    i === 1 ? 'bg-white/10 text-white' :
                    i === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/5 text-brand-gray'
                  }`}>
                    {i + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-brand-red/20 flex items-center justify-center text-sm font-semibold text-brand-red flex-shrink-0">
                    {v.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium">{v.full_name}</div>
                    <div className="text-xs text-brand-gray-light mt-0.5">
                      {v.city} · {v.role === 'vet' ? 'Vétérinaire' : v.role === 'steward' ? 'Gardien de zone' : 'Bénévole'}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-brand-gold">{v.reputation_score} pts</div>
                    <div className="text-[11px] mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full ${
                        v.is_available
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-white/5 text-brand-gray'
                      }`}>
                        {v.is_available ? '● Disponible' : '○ Indisponible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges system */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Système de badges</h2>
          <div className="space-y-2">
            {BADGES.map((badge) => (
              <div key={badge.name} className="bg-brand-dark-2 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{badge.icon}</span>
                <div>
                  <div className="text-sm font-medium text-white">{badge.name}</div>
                  <div className="text-xs text-brand-gray-light">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Reputation guide */}
          <div className="mt-6 bg-brand-dark-2 border border-white/5 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white mb-3">Points de réputation</h3>
            <div className="space-y-2 text-xs">
              {[
                { action: 'Signalement soumis', pts: '+10' },
                { action: 'Intervention terminée', pts: '+30' },
                { action: 'Adoption réussie', pts: '+50' },
                { action: 'Tutelle 30 jours', pts: '+20' },
                { action: 'Annulation d\'intervention', pts: '−10' },
              ].map((r) => (
                <div key={r.action} className="flex justify-between">
                  <span className="text-brand-gray-light">{r.action}</span>
                  <span className={r.pts.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                    {r.pts}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
