CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  source_id TEXT,
  demand INTEGER NOT NULL CHECK (demand >= 0),
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL
);
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  depot_id INTEGER NOT NULL DEFAULT 1 REFERENCES locations(id)
);
CREATE INDEX IF NOT EXISTS locations_location_gist_idx ON locations USING GIST (location);

INSERT INTO vehicles (id, name, capacity) VALUES
  (1, 'Truck 01', 100),
  (2, 'Truck 02', 100),
  (3, 'Truck 03', 100),
  (4, 'Truck 04', 100),
  (5, 'Truck 05', 100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, demand, x, y, location) VALUES
  (1, 'Distribution Center', 0, 82, 76, ST_SetSRID(ST_MakePoint(-122.386000, 37.832000), 4326)),
  (2, 'Customer 01', 19, 96, 44, ST_SetSRID(ST_MakePoint(-122.358000, 37.768000), 4326)),
  (3, 'Customer 02', 21, 50, 5, ST_SetSRID(ST_MakePoint(-122.450000, 37.690000), 4326)),
  (4, 'Customer 03', 6, 49, 8, ST_SetSRID(ST_MakePoint(-122.452000, 37.696000), 4326)),
  (5, 'Customer 04', 19, 13, 7, ST_SetSRID(ST_MakePoint(-122.524000, 37.694000), 4326)),
  (6, 'Customer 05', 7, 29, 89, ST_SetSRID(ST_MakePoint(-122.492000, 37.858000), 4326)),
  (7, 'Customer 06', 12, 58, 30, ST_SetSRID(ST_MakePoint(-122.434000, 37.740000), 4326)),
  (8, 'Customer 07', 16, 84, 39, ST_SetSRID(ST_MakePoint(-122.382000, 37.758000), 4326)),
  (9, 'Customer 08', 6, 14, 24, ST_SetSRID(ST_MakePoint(-122.522000, 37.728000), 4326)),
  (10, 'Customer 09', 16, 2, 39, ST_SetSRID(ST_MakePoint(-122.546000, 37.758000), 4326)),
  (11, 'Customer 10', 8, 3, 82, ST_SetSRID(ST_MakePoint(-122.544000, 37.844000), 4326)),
  (12, 'Customer 11', 14, 5, 10, ST_SetSRID(ST_MakePoint(-122.540000, 37.700000), 4326)),
  (13, 'Customer 12', 21, 98, 52, ST_SetSRID(ST_MakePoint(-122.354000, 37.784000), 4326)),
  (14, 'Customer 13', 16, 84, 25, ST_SetSRID(ST_MakePoint(-122.382000, 37.730000), 4326)),
  (15, 'Customer 14', 3, 61, 59, ST_SetSRID(ST_MakePoint(-122.428000, 37.798000), 4326)),
  (16, 'Customer 15', 22, 1, 65, ST_SetSRID(ST_MakePoint(-122.548000, 37.810000), 4326)),
  (17, 'Customer 16', 18, 88, 51, ST_SetSRID(ST_MakePoint(-122.374000, 37.782000), 4326)),
  (18, 'Customer 17', 19, 91, 2, ST_SetSRID(ST_MakePoint(-122.368000, 37.684000), 4326)),
  (19, 'Customer 18', 1, 19, 32, ST_SetSRID(ST_MakePoint(-122.512000, 37.744000), 4326)),
  (20, 'Customer 19', 24, 93, 3, ST_SetSRID(ST_MakePoint(-122.364000, 37.686000), 4326)),
  (21, 'Customer 20', 8, 50, 93, ST_SetSRID(ST_MakePoint(-122.450000, 37.866000), 4326)),
  (22, 'Customer 21', 12, 98, 14, ST_SetSRID(ST_MakePoint(-122.354000, 37.708000), 4326)),
  (23, 'Customer 22', 4, 5, 42, ST_SetSRID(ST_MakePoint(-122.540000, 37.764000), 4326)),
  (24, 'Customer 23', 8, 42, 9, ST_SetSRID(ST_MakePoint(-122.466000, 37.698000), 4326)),
  (25, 'Customer 24', 24, 61, 62, ST_SetSRID(ST_MakePoint(-122.428000, 37.804000), 4326)),
  (26, 'Customer 25', 24, 9, 97, ST_SetSRID(ST_MakePoint(-122.532000, 37.874000), 4326)),
  (27, 'Customer 26', 2, 80, 55, ST_SetSRID(ST_MakePoint(-122.390000, 37.790000), 4326)),
  (28, 'Customer 27', 20, 57, 69, ST_SetSRID(ST_MakePoint(-122.436000, 37.818000), 4326)),
  (29, 'Customer 28', 15, 23, 15, ST_SetSRID(ST_MakePoint(-122.504000, 37.710000), 4326)),
  (30, 'Customer 29', 2, 20, 70, ST_SetSRID(ST_MakePoint(-122.510000, 37.820000), 4326)),
  (31, 'Customer 30', 14, 85, 60, ST_SetSRID(ST_MakePoint(-122.380000, 37.800000), 4326)),
  (32, 'Customer 31', 9, 98, 5, ST_SetSRID(ST_MakePoint(-122.354000, 37.690000), 4326))
ON CONFLICT (id) DO NOTHING;
