'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const STATS = [
  { value: '1,247', label: 'Signalements traités' },
  { value: '312', label: 'Bénévoles actifs' },
  { value: '18 min', label: 'Temps de réponse moyen' },
  { value: '156', label: 'Adoptions réussies' },
];

const FEATURES = [
  {
    icon: '🧬',
    title: 'Identité Animale IA',
    desc: 'Chaque animal reçoit une empreinte numérique unique. Le même chien signalé à Casablanca et Marrakech est reconnu et lié automatiquement.',
    tag: 'U1',
  },
  {
    icon: '🎯',
    title: 'Moteur Prédictif',
    desc: "L'IA anticipe les pics d'abandons (post-Aïd, Ramadan, souk) et pré-positionne les bénévoles avant les crises.",
    tag: 'U2',
  },
  {
    icon: '📡',
    title: 'Radar Zones Mortes',
    desc: "Détection en temps réel des zones sans bénévoles. Recrutement automatique des citoyens vivant dans les angles morts.",
    tag: 'U3',
  },
  {
    icon: '🏘️',
    title: 'Gardiens de Zone',
    desc: "Modèle de tutelle inspiré de la jmaa marocaine. Un café, une mosquée, une école devient le gardien officiel de son quartier.",
    tag: 'U4',
  },
  {
    icon: '📋',
    title: 'Cycle de Vie Complet',
    desc: 'De la découverte à l\'adoption et aux check-ins à 1 an. Les donateurs suivent l\'animal précis qu\'ils ont aidé.',
    tag: 'U5',
  },
  {
    icon: '🏛️',
    title: 'API Gouvernementale',
    desc: 'Données agrégées pour les municipalités : densité animale, risques sanitaires, coûts d\'intervention par district.',
    tag: 'U6',
  },
];

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda'];

export default function HomePage() {
  const [activeCity, setActiveCity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCity((prev) => (prev + 1) % CITIES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-brand-gray-lightest">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-brand-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/icons/logo.svg" alt="RNSA" className="w-9 h-9" />
            <div>
              <div className="text-sm font-semibold text-white leading-none">RNSA Maroc</div>
              <div className="text-[10px] text-brand-gray-light leading-none mt-0.5">سauvetage Animalier</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-brand-gray-light">
            <Link href="/dashboard" className="hover:text-white transition-colors">Tableau de bord</Link>
            <Link href="/map" className="hover:text-white transition-colors">Carte nationale</Link>
            <Link href="/animals" className="hover:text-white transition-colors">Animaux</Link>
            <Link href="/reports" className="hover:text-white transition-colors">Signalements</Link>
          </div>
          <Link
            href="/dashboard"
            className="bg-brand-red hover:bg-brand-red-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Accéder →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="max-w-4xl">
          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
            </span>
            <span className="text-xs text-brand-gray-light font-medium tracking-wide uppercase">
              En direct —{' '}
              <span className="text-white transition-all duration-500">
                {CITIES[activeCity]}
              </span>
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-light text-white leading-[1.05] mb-6 tracking-tight">
            Chaque animal
            <br />
            <span className="font-semibold text-brand-red">a une histoire.</span>
            <br />
            <span className="text-brand-gray-lighter">Aidez-la à continuer.</span>
          </h1>

          <p className="text-xl text-brand-gray-light max-w-2xl leading-relaxed mb-10">
            Le premier réseau national marocain de sauvetage animalier.
            Intelligence artificielle, bénévoles géolocalisés, prédiction des crises —
            de Tanger à Laâyoune.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-light text-white font-medium px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-[1.02]"
            >
              Ouvrir le tableau de bord
              <span className="text-white/70">→</span>
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-xl text-base transition-all duration-200"
            >
              Voir la carte nationale
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-brand-gray-light">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="text-xs text-brand-red font-semibold tracking-widest uppercase mb-3">
            6 systèmes inédits en MENA
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-white">
            Une infrastructure de sauvetage,
            <br />
            pas une simple application.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.tag}
              className="bg-brand-dark-2 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{f.icon}</span>
                <span className="text-[10px] font-mono text-brand-gray bg-white/5 px-2 py-0.5 rounded">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-brand-gray-light leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Map preview CTA */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-brand-red/10 border border-brand-red/20 rounded-3xl p-10 md:p-16 text-center">
          <div className="text-5xl mb-6">🗺️</div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Carte nationale en temps réel
          </h2>
          <p className="text-brand-gray-light mb-8 max-w-xl mx-auto">
            Visualisez tous les signalements actifs, les zones à risque prédit,
            les angles morts de couverture et les points chauds saisonniers.
          </p>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-light text-white font-medium px-8 py-4 rounded-xl transition-colors"
          >
            Explorer la carte →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/icons/logo.svg" alt="RNSA" className="w-7 h-7" />
            <span className="text-sm text-brand-gray-light">
              RNSA Maroc — Réseau National de Sauvetage Animalier
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-brand-gray">
            <span>© 2024 RNSA Maroc</span>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/b2g" className="hover:text-white transition-colors">API Gouvernement</Link>
            <Link href="/settings" className="hover:text-white transition-colors">Paramètres</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
