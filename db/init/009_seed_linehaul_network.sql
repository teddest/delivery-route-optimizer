-- Linehaul freight scenario: shipments move between distribution centers.
CREATE TABLE IF NOT EXISTS linehaul_vehicles (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  capacity_pallets INTEGER NOT NULL CHECK (capacity_pallets > 0),
  home_depot_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS shipments (
  id INTEGER PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  origin_depot_id INTEGER NOT NULL REFERENCES locations(id),
  destination_depot_id INTEGER NOT NULL REFERENCES locations(id),
  pallets INTEGER NOT NULL CHECK (pallets > 0),
  weight_lbs INTEGER NOT NULL CHECK (weight_lbs > 0),
  delivery_deadline_hours INTEGER NOT NULL CHECK (delivery_deadline_hours > 0),
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'planned', 'in_transit'))
);

TRUNCATE linehaul_vehicles, shipments RESTART IDENTITY;

INSERT INTO linehaul_vehicles (id, name, capacity_pallets, home_depot_id) VALUES
  (1, 'Atlanta Linehaul 01', 26, 12),
  (2, 'Atlanta Linehaul 02', 26, 12),
  (3, 'Chicago Linehaul 01', 26, 26),
  (4, 'Miami Linehaul 01', 26, 16),
  (5, 'Charlotte Linehaul 01', 26, 11),
  (6, 'Boston Linehaul 01', 26, 1),
  (7, 'Detroit Linehaul 01', 26, 24),
  (8, 'Washington Linehaul 01', 26, 7),
  (9, 'New York Linehaul 01', 26, 4),
  (10, 'Philadelphia Linehaul 01', 26, 5),
  (11, 'Cleveland Linehaul 01', 26, 23),
  (12, 'Raleigh Linehaul 01', 26, 10),
  (13, 'Atlanta Linehaul 03', 26, 12),
  (14, 'Chicago Linehaul 02', 26, 26),
  (15, 'Chicago Linehaul 03', 26, 26),
  (16, 'Miami Linehaul 02', 26, 16)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, reference, origin_depot_id, destination_depot_id, pallets, weight_lbs, delivery_deadline_hours) VALUES
  (1, 'ATL-BOS-001', 12, 1, 12, 14500, 48),
  (2, 'ATL-BOS-002', 12, 1, 8, 9600, 48),
  (3, 'CHI-BOS-001', 26, 1, 18, 21400, 48),
  (4, 'MIA-PHL-001', 16, 5, 14, 16800, 60),
  (5, 'CLT-BOS-001', 11, 1, 10, 12100, 48),
  (6, 'ATL-NYC-001', 12, 4, 8, 9200, 42),
  (7, 'BOS-ATL-001', 1, 12, 16, 19200, 48),
  (8, 'DET-CLT-001', 24, 11, 12, 14200, 48),
  (9, 'CHI-ATL-001', 26, 12, 20, 23500, 42),
  (10, 'MIA-BOS-001', 16, 1, 10, 11800, 60),
  (11, 'NYC-ATL-001', 4, 12, 9, 10400, 48),
  (12, 'DC-MIA-001', 7, 16, 15, 17600, 48),
  (13, 'CLE-BOS-001', 23, 1, 14, 16200, 42),
  (14, 'PHL-ATL-001', 5, 12, 10, 11700, 48),
  (15, 'CHI-NYC-001', 26, 4, 8, 9400, 42)
ON CONFLICT (id) DO NOTHING;
