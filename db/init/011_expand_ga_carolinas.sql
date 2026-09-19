-- Add denser planning coverage across Georgia, North Carolina, and South Carolina.
INSERT INTO locations (id, name, address, source_id, demand, x, y, service_radius_miles, location) VALUES
  (129, 'Macon Distribution Center', 'Macon, GA', 'east-network-expansion-macon', 0, -83.6324, 32.8407, 150, ST_SetSRID(ST_MakePoint(-83.6324, 32.8407), 4326)),
  (130, 'Augusta Distribution Center', 'Augusta, GA', 'east-network-expansion-augusta', 0, -81.9748, 33.4735, 150, ST_SetSRID(ST_MakePoint(-81.9748, 33.4735), 4326)),
  (131, 'Columbus Distribution Center', 'Columbus, GA', 'east-network-expansion-columbus-ga', 0, -84.9877, 32.4610, 150, ST_SetSRID(ST_MakePoint(-84.9877, 32.4610), 4326)),
  (132, 'Albany Distribution Center', 'Albany, GA', 'east-network-expansion-albany-ga', 0, -84.1557, 31.5785, 150, ST_SetSRID(ST_MakePoint(-84.1557, 31.5785), 4326)),
  (133, 'Athens Distribution Center', 'Athens, GA', 'east-network-expansion-athens', 0, -83.3789, 33.9519, 150, ST_SetSRID(ST_MakePoint(-83.3789, 33.9519), 4326)),
  (134, 'Greensboro Distribution Center', 'Greensboro, NC', 'east-network-expansion-greensboro', 0, -79.7920, 36.0726, 150, ST_SetSRID(ST_MakePoint(-79.7920, 36.0726), 4326)),
  (135, 'Winston-Salem Distribution Center', 'Winston-Salem, NC', 'east-network-expansion-winston-salem', 0, -80.2442, 36.0999, 150, ST_SetSRID(ST_MakePoint(-80.2442, 36.0999), 4326)),
  (136, 'Durham Distribution Center', 'Durham, NC', 'east-network-expansion-durham', 0, -78.8986, 36.0033, 150, ST_SetSRID(ST_MakePoint(-78.8986, 36.0033), 4326)),
  (137, 'Fayetteville Distribution Center', 'Fayetteville, NC', 'east-network-expansion-fayetteville', 0, -78.8784, 35.0527, 150, ST_SetSRID(ST_MakePoint(-78.8784, 35.0527), 4326)),
  (138, 'Wilmington Distribution Center', 'Wilmington, NC', 'east-network-expansion-wilmington-nc', 0, -77.9447, 34.2257, 150, ST_SetSRID(ST_MakePoint(-77.9447, 34.2257), 4326)),
  (139, 'Asheville Distribution Center', 'Asheville, NC', 'east-network-expansion-asheville', 0, -82.5515, 35.5951, 150, ST_SetSRID(ST_MakePoint(-82.5515, 35.5951), 4326)),
  (140, 'Columbia Distribution Center', 'Columbia, SC', 'east-network-expansion-columbia-sc', 0, -81.0348, 34.0003, 150, ST_SetSRID(ST_MakePoint(-81.0348, 34.0003), 4326)),
  (141, 'Charleston Distribution Center', 'Charleston, SC', 'east-network-expansion-charleston-sc', 0, -79.9311, 32.7765, 150, ST_SetSRID(ST_MakePoint(-79.9311, 32.7765), 4326)),
  (142, 'Myrtle Beach Distribution Center', 'Myrtle Beach, SC', 'east-network-expansion-myrtle-beach', 0, -78.8867, 33.6891, 150, ST_SetSRID(ST_MakePoint(-78.8867, 33.6891), 4326)),
  (143, 'Spartanburg Distribution Center', 'Spartanburg, SC', 'east-network-expansion-spartanburg', 0, -81.9320, 34.9496, 150, ST_SetSRID(ST_MakePoint(-81.9320, 34.9496), 4326)),
  (144, 'Florence Distribution Center', 'Florence, SC', 'east-network-expansion-florence', 0, -79.7626, 34.1954, 150, ST_SetSRID(ST_MakePoint(-79.7626, 34.1954), 4326))
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  source_id = EXCLUDED.source_id,
  service_radius_miles = EXCLUDED.service_radius_miles,
  x = EXCLUDED.x,
  y = EXCLUDED.y,
  location = EXCLUDED.location;

INSERT INTO linehaul_vehicles (id, name, capacity_pallets, home_depot_id)
SELECT
  88 + ((depots.id - 129) * 3) + series.n,
  depots.name || ' Linehaul ' || lpad(series.n::text, 2, '0'),
  26,
  depots.id
FROM locations AS depots
CROSS JOIN generate_series(1, 3) AS series(n)
WHERE depots.id BETWEEN 129 AND 144
ON CONFLICT (id) DO NOTHING;
