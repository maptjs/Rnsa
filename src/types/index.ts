export type UserRole = 'citizen' | 'volunteer' | 'steward' | 'vet' | 'association_admin' | 'super_admin';

export type AnimalSpecies = 'dog' | 'cat' | 'horse' | 'bird' | 'unknown';
export type AnimalStatus = 'at_large' | 'rescued' | 'fostered' | 'adopted' | 'deceased';
export type AnimalGender = 'male' | 'female' | 'unknown';

export type ReportUrgency = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'new' | 'ai_processing' | 'assigned' | 'in_progress' | 'rescued' | 'closed';

export type InterventionStatus =
  | 'assigned'
  | 'accepted'
  | 'on_the_way'
  | 'on_site'
  | 'rescued'
  | 'closed';

export type LifecycleEventType =
  | 'sighting'
  | 'rescue'
  | 'vet_visit'
  | 'foster'
  | 'adoption'
  | 'checkin_30d'
  | 'checkin_6m'
  | 'checkin_1y'
  | 'deceased';

export type NotificationType =
  | 'new_case'
  | 'assigned'
  | 'status_update'
  | 'dead_zone_alert'
  | 'predicted_hotspot'
  | 'steward_alert'
  | 'adoption_checkin';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  city: string | null;
  avatar_url: string | null;
  fcm_token: string | null;
  reputation_score: number;
  is_available: boolean;
  location: GeoPoint | null;
  created_at: string;
}

export interface Animal {
  id: string;
  species: AnimalSpecies;
  estimated_age: string | null;
  gender: AnimalGender;
  distinctive_marks: string | null;
  nickname: string | null;
  status: AnimalStatus;
  first_seen_at: string;
  last_seen_at: string | null;
  sighting_count: number;
  story_public: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  animal_id: string | null;
  title: string;
  description: string | null;
  image_urls: string[];
  video_url: string | null;
  location: GeoPoint;
  city: string | null;
  district: string | null;
  urgency: ReportUrgency;
  status: ReportStatus;
  ai_urgency_score: number | null;
  ai_animal_type: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  animal?: Animal;
  assignee?: Profile;
}

export interface Intervention {
  id: string;
  report_id: string;
  volunteer_id: string;
  status: InterventionStatus;
  eta_minutes: number | null;
  started_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  resolution_note: string | null;
  resolution_photos: string[];
  created_at: string;
  volunteer?: Profile;
  report?: Report;
}

export interface StewardshipZone {
  id: string;
  steward_id: string;
  name: string;
  center: GeoPoint;
  radius_meters: number;
  description: string | null;
  is_active: boolean;
  total_cases: number;
  resolved_cases: number;
  created_at: string;
  steward?: Profile;
}

export interface LifecycleEvent {
  id: string;
  animal_id: string;
  event_type: LifecycleEventType;
  actor_id: string;
  notes: string | null;
  photo_urls: string[];
  location: GeoPoint | null;
  occurred_at: string;
  actor?: Profile;
}

export interface Adoption {
  id: string;
  animal_id: string;
  adopter_id: string;
  adoption_date: string;
  checkin_30d_at: string | null;
  checkin_6m_at: string | null;
  checkin_1y_at: string | null;
  notes: string | null;
  photos: string[];
  adopter?: Profile;
}

export interface Organization {
  id: string;
  name: string;
  type: 'association' | 'vet_clinic' | 'shelter' | 'ngo';
  city: string;
  location: GeoPoint;
  contact_phone: string | null;
  contact_email: string | null;
  is_verified: boolean;
  capacity: number | null;
  current_load: number;
}

export interface PredictedHotspot {
  id: string;
  city: string;
  district: string;
  center: GeoPoint;
  radius_meters: number;
  risk_score: number;
  trigger_reason: string;
  predicted_for: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface MunicipalitySubscription {
  id: string;
  municipality: string;
  region: string;
  api_key: string;
  plan: 'basic' | 'pro' | 'enterprise';
  active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_reports: number;
  active_reports: number;
  resolved_reports: number;
  total_volunteers: number;
  active_volunteers: number;
  total_animals: number;
  adopted_animals: number;
  avg_response_time_minutes: number;
  reports_by_urgency: Record<ReportUrgency, number>;
  reports_by_city: Array<{ city: string; count: number }>;
  monthly_trend: Array<{ month: string; reports: number; resolved: number }>;
}

export interface B2GStats {
  total_reports: number;
  resolved_rate: number;
  avg_response_time_minutes: number;
  top_animal_types: Array<{ type: string; count: number }>;
  monthly_trend: Array<{ month: string; count: number }>;
  estimated_stray_population: number;
}

export interface AnimalMatchResult {
  matched: boolean;
  animal: Animal | null;
  similarity: number;
  previous_sightings: number;
  last_location: GeoPoint | null;
}
