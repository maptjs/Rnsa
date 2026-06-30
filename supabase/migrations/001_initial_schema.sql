-- ================================================
-- RNSA Maroc — Database Migration
-- Run this in your Supabase SQL Editor
-- ================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------
-- PROFILES (extends auth.users)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  phone           TEXT,
  role            TEXT DEFAULT 'citizen'
    CHECK (role IN ('citizen','volunteer','steward','vet','association_admin','super_admin')),
  city            TEXT,
  avatar_url      TEXT,
  fcm_token       TEXT,
  reputation_score INT DEFAULT 0,
  is_available    BOOLEAN DEFAULT TRUE,
  location        GEOGRAPHY(POINT, 4326),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- ANIMALS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS animals (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint_embedding VECTOR(512),
  species               TEXT CHECK (species IN ('dog','cat','horse','bird','unknown')),
  estimated_age         TEXT,
  gender                TEXT DEFAULT 'unknown' CHECK (gender IN ('male','female','unknown')),
  distinctive_marks     TEXT,
  nickname              TEXT,
  status                TEXT DEFAULT 'at_large'
    CHECK (status IN ('at_large','rescued','fostered','adopted','deceased')),
  first_seen_at         TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at          TIMESTAMPTZ,
  sighting_count        INT DEFAULT 1,
  story_public          BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- REPORTS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  animal_id       UUID REFERENCES animals(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  image_urls      TEXT[] DEFAULT '{}',
  video_url       TEXT,
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  city            TEXT,
  district        TEXT,
  urgency         TEXT DEFAULT 'medium'
    CHECK (urgency IN ('low','medium','high','critical')),
  status          TEXT DEFAULT 'new'
    CHECK (status IN ('new','ai_processing','assigned','in_progress','rescued','closed')),
  ai_urgency_score FLOAT CHECK (ai_urgency_score BETWEEN 0 AND 1),
  ai_animal_type  TEXT,
  assigned_to     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- INTERVENTIONS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS interventions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id        UUID REFERENCES reports(id) ON DELETE CASCADE,
  volunteer_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status           TEXT DEFAULT 'assigned'
    CHECK (status IN ('assigned','accepted','on_the_way','on_site','rescued','closed')),
  eta_minutes      INT,
  started_at       TIMESTAMPTZ,
  arrived_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  resolution_note  TEXT,
  resolution_photos TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- STEWARDSHIP ZONES
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS stewardship_zones (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  steward_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  center         GEOGRAPHY(POINT, 4326) NOT NULL,
  radius_meters  INT DEFAULT 500,
  description    TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  total_cases    INT DEFAULT 0,
  resolved_cases INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- LIFECYCLE EVENTS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS lifecycle_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id   UUID REFERENCES animals(id) ON DELETE CASCADE,
  event_type  TEXT CHECK (event_type IN (
    'sighting','rescue','vet_visit','foster','adoption',
    'checkin_30d','checkin_6m','checkin_1y','deceased'
  )),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes       TEXT,
  photo_urls  TEXT[] DEFAULT '{}',
  location    GEOGRAPHY(POINT, 4326),
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- ADOPTIONS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS adoptions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id      UUID REFERENCES animals(id) ON DELETE CASCADE,
  adopter_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  adoption_date  DATE NOT NULL,
  checkin_30d_at TIMESTAMPTZ,
  checkin_6m_at  TIMESTAMPTZ,
  checkin_1y_at  TIMESTAMPTZ,
  notes          TEXT,
  photos         TEXT[] DEFAULT '{}'
);

-- ------------------------------------------------
-- ORGANIZATIONS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  type           TEXT CHECK (type IN ('association','vet_clinic','shelter','ngo')),
  city           TEXT,
  location       GEOGRAPHY(POINT, 4326),
  contact_phone  TEXT,
  contact_email  TEXT,
  is_verified    BOOLEAN DEFAULT FALSE,
  capacity       INT,
  current_load   INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- PREDICTED HOTSPOTS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS predicted_hotspots (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city           TEXT,
  district       TEXT,
  center         GEOGRAPHY(POINT, 4326),
  radius_meters  INT DEFAULT 800,
  risk_score     FLOAT CHECK (risk_score BETWEEN 0 AND 1),
  trigger_reason TEXT,
  predicted_for  DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT CHECK (type IN (
    'new_case','assigned','status_update','dead_zone_alert',
    'predicted_hotspot','steward_alert','adoption_checkin'
  )),
  title      TEXT,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- B2G MUNICIPALITY SUBSCRIPTIONS
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS municipality_subscriptions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality TEXT NOT NULL,
  region       TEXT,
  api_key      TEXT UNIQUE NOT NULL,
  plan         TEXT DEFAULT 'basic' CHECK (plan IN ('basic','pro','enterprise')),
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_reports_location    ON reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_reports_urgency     ON reports(urgency);
CREATE INDEX IF NOT EXISTS idx_reports_status      ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at  ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_location   ON profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_hotspots_center     ON predicted_hotspots USING GIST(center);
CREATE INDEX IF NOT EXISTS idx_hotspots_date       ON predicted_hotspots(predicted_for);
CREATE INDEX IF NOT EXISTS idx_zones_center        ON stewardship_zones USING GIST(center);
CREATE INDEX IF NOT EXISTS idx_lifecycle_animal    ON lifecycle_events(animal_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user  ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_animal_embedding    ON animals USING ivfflat(fingerprint_embedding vector_cosine_ops)
  WITH (lists = 100);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stewardship_zones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicted_hotspots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- animals
CREATE POLICY "Anyone can read animals" ON animals FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert animals" ON animals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update animals" ON animals FOR UPDATE USING (auth.uid() IS NOT NULL);

-- reports
CREATE POLICY "Public can read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporter or assignee can update" ON reports FOR UPDATE
  USING (auth.uid() = reporter_id OR auth.uid() = assigned_to);

-- interventions
CREATE POLICY "Authenticated can read interventions" ON interventions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Volunteers can update own interventions" ON interventions FOR UPDATE USING (auth.uid() = volunteer_id);
CREATE POLICY "Authenticated can insert interventions" ON interventions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- stewardship_zones
CREATE POLICY "Anyone can read zones" ON stewardship_zones FOR SELECT USING (true);
CREATE POLICY "Stewards manage own zones" ON stewardship_zones FOR ALL USING (auth.uid() = steward_id);

-- lifecycle_events
CREATE POLICY "Anyone can read events" ON lifecycle_events FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert events" ON lifecycle_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- adoptions
CREATE POLICY "Authenticated can read adoptions" ON adoptions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Adopters manage own adoptions" ON adoptions FOR ALL USING (auth.uid() = adopter_id);

-- notifications (private per user)
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- predicted_hotspots (public read)
CREATE POLICY "Anyone can read hotspots" ON predicted_hotspots FOR SELECT USING (true);

-- organizations (public read)
CREATE POLICY "Anyone can read organizations" ON organizations FOR SELECT USING (true);

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-update updated_at on reports
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile after user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment animal sighting count on new report
CREATE OR REPLACE FUNCTION increment_animal_sighting()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.animal_id IS NOT NULL THEN
    UPDATE animals
    SET sighting_count = sighting_count + 1,
        last_seen_at = NOW()
    WHERE id = NEW.animal_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_report_inserted
  AFTER INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION increment_animal_sighting();

-- ================================================
-- SAMPLE DATA (optional — remove for production)
-- ================================================
INSERT INTO organizations (name, type, city, contact_email, is_verified, capacity, current_load)
VALUES
  ('SPA Casablanca', 'shelter', 'Casablanca', 'contact@spa-casa.ma', true, 80, 62),
  ('Vétérinaire El Fida', 'vet_clinic', 'Casablanca', 'clinic@elfida.ma', true, NULL, 0),
  ('Association Animaux Rabat', 'association', 'Rabat', 'info@aar.ma', true, NULL, 0),
  ('Refuge Marrakech', 'shelter', 'Marrakech', 'refuge@marrakech.ma', false, 40, 28);
