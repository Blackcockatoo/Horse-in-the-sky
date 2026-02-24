-- HMFFCC Logbook Schema
-- Run once against your Supabase instance.

CREATE TABLE IF NOT EXISTS log_entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('rain', 'spray', 'maintenance', 'flight', 'note')),
  note        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION
);

CREATE INDEX idx_log_entries_created ON log_entries (created_at DESC);
CREATE INDEX idx_log_entries_type ON log_entries (type);

-- Weather snapshots for historical analysis
CREATE TABLE IF NOT EXISTS weather_snapshots (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location    TEXT NOT NULL CHECK (location IN ('farm', 'airport')),
  temp_c      REAL,
  dewpoint_c  REAL,
  wind_speed_kmh REAL,
  wind_gust_kmh  REAL,
  wind_dir_deg   INTEGER,
  rain_mm     REAL,
  pressure_hpa REAL,
  cloud_cover_pct INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wx_snapshots_created ON weather_snapshots (created_at DESC);

-- Decision log: what the engine said and when
CREATE TABLE IF NOT EXISTS decision_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flight_verdict  TEXT CHECK (flight_verdict IN ('GO', 'CAUTION', 'NO_GO')),
  flight_reason   TEXT,
  spray_verdict   TEXT CHECK (spray_verdict IN ('GO', 'CAUTION', 'NO_GO')),
  spray_reason    TEXT,
  warnings_count  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_decision_log_created ON decision_log (created_at DESC);
