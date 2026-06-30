'use client';

import { useEffect, useRef, useState } from 'react';
import { MOCK_STATS, MOCK_REPORTS, MOCK_ANIMALS } from '@/lib/mock-data';
import { urgencyLabel, urgencyBadgeClass, statusLabel, timeAgo, speciesEmoji } from '@/lib/utils';

export default function DashboardPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let lineChart: unknown = null;
    let pieChart: unknown = null;

    const loadCharts = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      if (chartRef.current) {
        lineChart = new Chart(chartRef.current, {
          type: 'bar',
          data: {
            labels: MOCK_STATS.monthly_trend.map((d) => d.month),
            datasets: [
              {
                label: 'Signalements',
                data: MOCK_STATS.monthly_trend.map((d) => d.reports),
                backgroundColor: 'rgba(193,18,31,0.7)',
                borderRadius: 4,
              },
              {
                label: 'Résolus',
                data: MOCK_STATS.monthly_trend.map((d) => d.resolved),
                backgroundColor: 'rgba(46,125,50,0.7)',
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1A1A18',
                borderColor: '#2a2a28',
                borderWidth: 1,
                titleColor: '#F5F5F2',
                bodyColor: '#9B9B96',
              },
            },
            scales: {
              x: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: '#6B6B66', font: { size: 11 } },
              },
              y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#6B6B66', font: { size: 11 } },
              },
            },
          },
        });
      }

      if (pieRef.current) {
        pieChart = new Chart(pieRef.current, {
          type: 'doughnut',
          data: {
            labels: MOCK_STATS.reports_by_city.map((d) => d.city),
            datasets: [
              {
                data: MOCK_STATS.reports_by_city.map((d) => d.count),
                backgroundColor: [
                  '#C1121F', '#E65100', '#2E7D32', '#1976D2',
                  '#7B1FA2', '#00695C', '#6B6B66',
                ],
                borderWidth: 0,
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1A1A18',
                borderColor: '#2a2a28',
                borderWidth: 1,
                titleColor: '#F5F5F2',
                bodyColor: '#9B9B96',
              },
            },
          },
        });
      }
    };

    loadCharts();

    return () => {
      if (lineChart && typeof (lineChart as { destroy?: () => void }).destroy === 'function') {
        (lineChart as { destroy: () => void }).destroy();
      }
      if (pieChart && typeof (pieChart as { destroy?: () => void }).destroy === 'function') {
        (pieChart as { destroy: () => void }).destroy();
      }
    };
  }, [mounted]);

  const stats = MOCK_STATS;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Tableau de bord</h1>
        <p className="text-brand-gray-light text-sm mt-1">
          Vue d&apos;ensemble nationale — mis à jour en temps réel
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Signalements totaux', value: stats.total_reports.toLocaleString('fr'), sub: `${stats.active_reports} actifs`, color: 'text-white' },
          { label: 'Taux de résolution', value: Math.round((stats.resolved_reports / stats.total_reports) * 100) + '%', sub: `${stats.resolved_reports.toLocaleString('fr')} résolus`, color: 'text-green-400' },
          { label: 'Bénévoles actifs', value: stats.active_volunteers, sub: `${stats.total_volunteers} inscrits`, color: 'text-blue-400' },
          { label: 'Temps de réponse', value: stats.avg_response_time_minutes + ' min', sub: 'Temps moyen', color: 'text-brand-gold' },
        ].map((kpi) => (
          <div key={kpi.label} className="stat-card">
            <div className="text-xs text-brand-gray-light mb-2">{kpi.label}</div>
            <div className={`text-2xl font-semibold ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className="text-xs text-brand-gray">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Animaux identifiés', value: stats.total_animals.toLocaleString('fr'), sub: 'Dans la base IA', color: 'text-white' },
          { label: 'Adoptions', value: stats.adopted_animals, sub: 'Familles trouvées', color: 'text-purple-400' },
          { label: 'Urgences critiques', value: stats.reports_by_urgency.critical, sub: 'Signalements actifs', color: 'text-red-400' },
          { label: 'Urgences élevées', value: stats.reports_by_urgency.high, sub: 'En cours', color: 'text-orange-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="stat-card">
            <div className="text-xs text-brand-gray-light mb-2">{kpi.label}</div>
            <div className={`text-2xl font-semibold ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className="text-xs text-brand-gray">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trend chart */}
        <div className="lg:col-span-2 bg-brand-dark-2 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Évolution mensuelle</h2>
            <div className="flex items-center gap-4 text-xs text-brand-gray-light">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-brand-red inline-block"></span>Signalements</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-green-700 inline-block"></span>Résolus</span>
            </div>
          </div>
          <div style={{ height: 220 }}>
            {mounted && <canvas ref={chartRef} role="img" aria-label="Graphique évolution mensuelle des signalements"></canvas>}
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-brand-dark-2 border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Répartition par ville</h2>
          <div style={{ height: 160 }}>
            {mounted && <canvas ref={pieRef} role="img" aria-label="Graphique répartition par ville"></canvas>}
          </div>
          <div className="mt-4 space-y-1.5">
            {MOCK_STATS.reports_by_city.slice(0, 5).map((city, i) => {
              const colors = ['#C1121F', '#E65100', '#2E7D32', '#1976D2', '#7B1FA2'];
              return (
                <div key={city.city} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-brand-gray-light">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors[i] }}></span>
                    {city.city}
                  </span>
                  <span className="text-white font-medium">{city.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-dark-2 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Signalements récents</h2>
            <a href="/reports" className="text-xs text-brand-red hover:text-brand-red-light">Voir tout →</a>
          </div>
          <div className="space-y-3">
            {MOCK_REPORTS.slice(0, 4).map((report) => (
              <div key={report.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  report.urgency === 'critical' ? 'bg-gray-400' :
                  report.urgency === 'high' ? 'bg-red-400' :
                  report.urgency === 'medium' ? 'bg-orange-400' : 'bg-green-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{report.title}</div>
                  <div className="text-xs text-brand-gray-light mt-0.5">{report.city} · {report.district}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${urgencyBadgeClass(report.urgency)}`}>
                    {urgencyLabel(report.urgency)}
                  </span>
                  <div className="text-[11px] text-brand-gray mt-1">{timeAgo(report.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animal stats */}
        <div className="bg-brand-dark-2 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Animaux récents</h2>
            <a href="/animals" className="text-xs text-brand-red hover:text-brand-red-light">Voir tout →</a>
          </div>
          <div className="space-y-3">
            {MOCK_ANIMALS.map((animal) => (
              <div key={animal.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                  {speciesEmoji(animal.species)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium">{animal.nickname || 'Sans nom'}</div>
                  <div className="text-xs text-brand-gray-light mt-0.5">
                    {animal.sighting_count} signalement{animal.sighting_count > 1 ? 's' : ''} · {animal.estimated_age}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium border ${
                  animal.status === 'adopted' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  animal.status === 'fostered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  animal.status === 'rescued' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  'bg-orange-500/10 text-orange-400 border-orange-500/20'
                }`}>
                  {statusLabel(animal.status)}
                </span>
              </div>
            ))}
          </div>

          {/* Urgency distribution */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="text-xs text-brand-gray-light mb-3">Répartition par urgence</div>
            <div className="space-y-2">
              {([
                { label: 'Critique', count: stats.reports_by_urgency.critical, color: 'bg-gray-500', urgency: 'critical' },
                { label: 'Élevée', count: stats.reports_by_urgency.high, color: 'bg-red-500', urgency: 'high' },
                { label: 'Moyenne', count: stats.reports_by_urgency.medium, color: 'bg-orange-500', urgency: 'medium' },
                { label: 'Faible', count: stats.reports_by_urgency.low, color: 'bg-green-500', urgency: 'low' },
              ] as const).map((item) => {
                const pct = Math.round((item.count / stats.total_reports) * 100);
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-brand-gray-light w-16">{item.label}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5">
                      <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-brand-gray w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
