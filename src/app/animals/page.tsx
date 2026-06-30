'use client';

import { useState } from 'react';
import { MOCK_ANIMALS } from '@/lib/mock-data';
import { speciesEmoji, speciesLabel, statusLabel, formatDate } from '@/lib/utils';
import type { AnimalStatus, AnimalSpecies } from '@/types';

export default function AnimalsPage() {
  const [speciesFilter, setSpeciesFilter] = useState<AnimalSpecies | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AnimalStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = MOCK_ANIMALS.filter((a) => {
    if (speciesFilter !== 'all' && a.species !== speciesFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search && !a.nickname?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusBadge = (status: AnimalStatus) => {
    const map = {
      at_large: 'bg-orange-900/40 text-orange-300 border-orange-800',
      rescued: 'bg-green-900/40 text-green-300 border-green-800',
      fostered: 'bg-blue-900/40 text-blue-300 border-blue-800',
      adopted: 'bg-purple-900/40 text-purple-300 border-purple-800',
      deceased: 'bg-white/5 text-brand-gray border-white/10',
    };
    return map[status];
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Identités animales</h1>
          <p className="text-brand-gray-light text-sm mt-1">
            Base de données IA — {MOCK_ANIMALS.length} animaux identifiés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              viewMode === 'grid' ? 'bg-white/10 text-white border-white/20' : 'text-brand-gray border-white/5 hover:text-white'
            }`}
          >
            Grille
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              viewMode === 'list' ? 'bg-white/10 text-white border-white/20' : 'text-brand-gray border-white/5 hover:text-white'
            }`}
          >
            Liste
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher par surnom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark flex-1 min-w-48 max-w-sm"
        />
        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value as AnimalSpecies | 'all')}
          className="input-dark w-36"
        >
          <option value="all">Toutes espèces</option>
          <option value="dog">Chiens</option>
          <option value="cat">Chats</option>
          <option value="horse">Chevaux</option>
          <option value="bird">Oiseaux</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AnimalStatus | 'all')}
          className="input-dark w-44"
        >
          <option value="all">Tous statuts</option>
          <option value="at_large">En liberté</option>
          <option value="rescued">Sauvé</option>
          <option value="fostered">Famille d&apos;accueil</option>
          <option value="adopted">Adopté</option>
          <option value="deceased">Décédé</option>
        </select>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { status: 'at_large' as AnimalStatus, label: 'En liberté', count: MOCK_ANIMALS.filter(a => a.status === 'at_large').length, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
          { status: 'rescued' as AnimalStatus, label: 'Sauvés', count: MOCK_ANIMALS.filter(a => a.status === 'rescued').length, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
          { status: 'fostered' as AnimalStatus, label: 'Famille accueil', count: MOCK_ANIMALS.filter(a => a.status === 'fostered').length, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { status: 'adopted' as AnimalStatus, label: 'Adoptés', count: MOCK_ANIMALS.filter(a => a.status === 'adopted').length, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
        ].map((item) => (
          <button
            key={item.status}
            onClick={() => setStatusFilter(statusFilter === item.status ? 'all' : item.status)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === item.status ? item.color : 'bg-white/5 text-brand-gray border-white/5 hover:text-white'
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((animal) => (
            <div
              key={animal.id}
              className="bg-brand-dark-2 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors cursor-pointer group"
            >
              {/* Photo placeholder */}
              <div className="h-32 bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
                <span className="text-5xl">{speciesEmoji(animal.species)}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-white">{animal.nickname || 'Sans nom'}</h3>
                  <span className="text-[10px] text-brand-gray font-mono flex-shrink-0">
                    #{animal.id.slice(-4)}
                  </span>
                </div>
                <div className="text-xs text-brand-gray-light mb-3">
                  {speciesLabel(animal.species)} · {animal.estimated_age || 'Âge inconnu'}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusBadge(animal.status)}`}>
                    {statusLabel(animal.status)}
                  </span>
                  <span className="text-[10px] text-brand-gray">
                    {animal.sighting_count} vue{animal.sighting_count > 1 ? 's' : ''}
                  </span>
                </div>
                {animal.distinctive_marks && (
                  <p className="text-[11px] text-brand-gray mt-2 line-clamp-2">{animal.distinctive_marks}</p>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-16 text-brand-gray">
              Aucun animal ne correspond aux critères de recherche.
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="bg-brand-dark-2 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Animal', 'Espèce', 'Statut', 'Signalements', 'Première vue', 'Dernière vue'].map((h) => (
                  <th key={h} className="text-left text-xs text-brand-gray-light font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((animal) => (
                <tr key={animal.id} className="border-b border-white/[0.03] table-row-hover cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{speciesEmoji(animal.species)}</span>
                      <div>
                        <div className="text-sm text-white font-medium">{animal.nickname || 'Sans nom'}</div>
                        {animal.distinctive_marks && (
                          <div className="text-xs text-brand-gray-light line-clamp-1">{animal.distinctive_marks}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-gray-light">{speciesLabel(animal.species)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusBadge(animal.status)}`}>
                      {statusLabel(animal.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{animal.sighting_count}</td>
                  <td className="px-4 py-3 text-xs text-brand-gray-light">{formatDate(animal.first_seen_at)}</td>
                  <td className="px-4 py-3 text-xs text-brand-gray-light">
                    {animal.last_seen_at ? formatDate(animal.last_seen_at) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
