import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReportUrgency, AnimalStatus, InterventionStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function urgencyColor(urgency: ReportUrgency): string {
  const map: Record<ReportUrgency, string> = {
    critical: '#1a1a18',
    high: '#C1121F',
    medium: '#E65100',
    low: '#2E7D32',
  };
  return map[urgency];
}

export function urgencyLabel(urgency: ReportUrgency): string {
  const map: Record<ReportUrgency, string> = {
    critical: 'Critique',
    high: 'Élevée',
    medium: 'Moyenne',
    low: 'Faible',
  };
  return map[urgency];
}

export function urgencyBadgeClass(urgency: ReportUrgency): string {
  const map: Record<ReportUrgency, string> = {
    critical: 'bg-gray-900 text-white',
    high: 'bg-red-100 text-red-800 border border-red-200',
    medium: 'bg-orange-100 text-orange-800 border border-orange-200',
    low: 'bg-green-100 text-green-800 border border-green-200',
  };
  return map[urgency];
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    new: 'Nouveau',
    ai_processing: 'Analyse IA',
    assigned: 'Assigné',
    in_progress: 'En cours',
    rescued: 'Sauvé',
    closed: 'Fermé',
    at_large: 'En liberté',
    fostered: 'En famille d\'accueil',
    adopted: 'Adopté',
    deceased: 'Décédé',
    accepted: 'Accepté',
    on_the_way: 'En route',
    on_site: 'Sur place',
  };
  return map[status] || status;
}

export function animalStatusColor(status: AnimalStatus): string {
  const map: Record<AnimalStatus, string> = {
    at_large: '#E65100',
    rescued: '#2E7D32',
    fostered: '#1976D2',
    adopted: '#7B1FA2',
    deceased: '#6B6B66',
  };
  return map[status];
}

export function speciesLabel(species: string): string {
  const map: Record<string, string> = {
    dog: 'Chien',
    cat: 'Chat',
    horse: 'Cheval',
    bird: 'Oiseau',
    unknown: 'Inconnu',
  };
  return map[species] || species;
}

export function speciesEmoji(species: string): string {
  const map: Record<string, string> = {
    dog: '🐕',
    cat: '🐈',
    horse: '🐴',
    bird: '🐦',
    unknown: '🐾',
  };
  return map[species] || '🐾';
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 2592000) return `Il y a ${Math.floor(seconds / 86400)}j`;
  return formatDate(dateString);
}

export function riskScoreColor(score: number): string {
  if (score >= 0.8) return '#C1121F';
  if (score >= 0.6) return '#E65100';
  if (score >= 0.4) return '#F9A825';
  return '#2E7D32';
}

export function riskScoreLabel(score: number): string {
  if (score >= 0.8) return 'Critique';
  if (score >= 0.6) return 'Élevé';
  if (score >= 0.4) return 'Modéré';
  return 'Faible';
}

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return 'rnsa_' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
