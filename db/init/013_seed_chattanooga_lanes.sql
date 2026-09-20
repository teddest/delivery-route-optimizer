-- Increase inbound and outbound LTL lane density through Chattanooga.
INSERT INTO shipments (
  id,
  reference,
  origin_depot_id,
  destination_depot_id,
  pallets,
  weight_lbs,
  delivery_deadline_hours,
  status
) VALUES
  (1200, 'ATL-CHA-001', 12, 116, 8, 9600, 48, 'ready'),
  (1201, 'CLT-CHA-001', 11, 116, 10, 11800, 48, 'ready'),
  (1202, 'BHM-CHA-001', 17, 116, 7, 8200, 36, 'ready'),
  (1203, 'NSH-CHA-001', 18, 116, 9, 10500, 36, 'ready'),
  (1204, 'CHA-ATL-001', 116, 12, 8, 9400, 36, 'ready'),
  (1205, 'CHA-CLT-001', 116, 11, 6, 7100, 24, 'ready'),
  (1206, 'CHA-RAL-001', 116, 10, 10, 11900, 36, 'ready'),
  (1207, 'CHA-MIA-001', 116, 16, 7, 8300, 48, 'ready')
ON CONFLICT (id) DO NOTHING;

-- Additional outbound capacity for the higher Chattanooga lane volume.
INSERT INTO linehaul_vehicles (id, name, capacity_pallets, home_depot_id) VALUES
  (3000, 'Chattanooga Linehaul 06', 26, 116),
  (3001, 'Chattanooga Linehaul 07', 26, 116)
ON CONFLICT (id) DO NOTHING;
