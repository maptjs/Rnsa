'use client';

import { useState } from 'react';
import { MOCK_REPORTS } from '@/lib/mock-data';
import { urgencyLabel, urgencyBadgeClass, statusLabel, timeAgo, speciesEmoji } from '@/lib/utils';
import type { ReportUrgency, ReportStatus } from '@/types';

const STATUS_OPTIONS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'new', label: 'Nouveau' },
  { value: 'assigned', label: 'Assigné' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'rescued', label: 'Sauvé' },
  { value: 'closed', label: 'Fermé' },
];

const URGENCY_OPTIONS: { value: ReportUrgency | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes urgences' },
  { value: 'critical', label: 'Critique' },
  { value: 'high', label: 'Élevée' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Faible' },
];

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<ReportUrgency | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_REPORTS.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
        !r.city?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Signalements</h1>
          <p className="text-brand-gray-light text-sm mt-1">{filtered.length} signalement{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="bg-brand-red hover:bg-brand-red-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nouveau signalement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher par titre ou ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark flex-1 min-w-48 max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
          className="input-dark w-44"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value as ReportUrgency | 'all')}
          className="input-dark w-44"
        >
          {URGENCY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-brand-dark-2 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Signalement', 'Localisation', 'Urgence', 'Statut', 'IA Score', 'Date'].map((h) => (
                <th key={h} className="text-left text-xs text-brand-gray-light font-medium px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-brand-gray">
                  Aucun signalement ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            ) : (
              filtered.map((report, i) => (
                <tr
                  key={report.id}
                  className={`border-b border-white/[0.03] table-row-hover cursor-pointer ${i % 2 === 0 ? '' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: report.urgency === 'critical' ? '#888' :
                                      report.urgency === 'high' ? '#C1121F' :
                                      report.urgency === 'medium' ? '#E65100' : '#2E7D32'
                        }}
                      />
                      <div>
                        <div className="text-sm text-white">{report.title}</div>
                        {report.animal && (
                          <div className="text-xs text-brand-gray-light">
                            {speciesEmoji(report.animal.species)} {report.animal.nickname || 'Animal sans nom'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-gray-light">
                    {report.city}
                    {report.district && <span className="text-brand-gray"> · {report.district}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${urgencyBadgeClass(report.urgency)}`}>
                      {urgencyLabel(report.urgency)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      report.status === 'rescued' || report.status === 'closed'
                        ? 'bg-green-900/30 text-green-400 border-green-800'
                        : report.status === 'new'
                        ? 'bg-blue-900/30 text-blue-400 border-blue-800'
                        : 'bg-white/5 text-brand-gray-light border-white/10'
                    }`}>
                      {statusLabel(report.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {report.ai_urgency_score ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded-full h-1 w-16">
                          <div
                            className="h-1 rounded-full"
                            style={{
                              width: `${Math.round(report.ai_urgency_score * 100)}%`,
                              background: report.ai_urgency_score > 0.8 ? '#C1121F' :
                                          report.ai_urgency_score > 0.6 ? '#E65100' : '#2E7D32'
                            }}
                          />
                        </div>
                        <span className="text-xs text-brand-gray">{Math.round(report.ai_urgency_score * 100)}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-brand-gray">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-gray-light whitespace-nowrap">
                    {timeAgo(report.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
