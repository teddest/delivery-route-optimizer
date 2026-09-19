-- Expand the LTL hub network so the eastern region has denser 150-mile coverage.
-- These are planning hubs at representative metro locations; service-radius
-- enforcement happens in the optimizer using service_radius_miles.
INSERT INTO locations (id, name, address, source_id, demand, x, y, service_radius_miles, location) VALUES
  (105, 'Portland Distribution Center', 'Portland, ME', 'east-network-expansion-portland', 0, -70.2553, 43.6591, 150, ST_SetSRID(ST_MakePoint(-70.2553, 43.6591), 4326)),
  (106, 'Manchester Distribution Center', 'Manchester, NH', 'east-network-expansion-manchester', 0, -71.4548, 42.9956, 150, ST_SetSRID(ST_MakePoint(-71.4548, 42.9956), 4326)),
  (107, 'Syracuse Distribution Center', 'Syracuse, NY', 'east-network-expansion-syracuse', 0, -76.1474, 43.0481, 150, ST_SetSRID(ST_MakePoint(-76.1474, 43.0481), 4326)),
  (108, 'Rochester Distribution Center', 'Rochester, NY', 'east-network-expansion-rochester', 0, -77.6109, 43.1566, 150, ST_SetSRID(ST_MakePoint(-77.6109, 43.1566), 4326)),
  (109, 'Erie Distribution Center', 'Erie, PA', 'east-network-expansion-erie', 0, -80.0851, 42.1292, 150, ST_SetSRID(ST_MakePoint(-80.0851, 42.1292), 4326)),
  (110, 'Scranton Distribution Center', 'Scranton, PA', 'east-network-expansion-scranton', 0, -75.6624, 41.4090, 150, ST_SetSRID(ST_MakePoint(-75.6624, 41.4090), 4326)),
  (111, 'Harrisburg Distribution Center', 'Harrisburg, PA', 'east-network-expansion-harrisburg', 0, -76.8867, 40.2732, 150, ST_SetSRID(ST_MakePoint(-76.8867, 40.2732), 4326)),
  (112, 'Wilmington Distribution Center', 'Wilmington, DE', 'east-network-expansion-wilmington', 0, -75.5398, 39.7391, 150, ST_SetSRID(ST_MakePoint(-75.5398, 39.7391), 4326)),
  (113, 'Charleston Distribution Center', 'Charleston, WV', 'east-network-expansion-charleston-wv', 0, -81.6326, 38.3362, 150, ST_SetSRID(ST_MakePoint(-81.6326, 38.3362), 4326)),
  (114, 'Roanoke Distribution Center', 'Roanoke, VA', 'east-network-expansion-roanoke', 0, -79.9414, 37.2710, 150, ST_SetSRID(ST_MakePoint(-79.9414, 37.2710), 4326)),
  (115, 'Knoxville Distribution Center', 'Knoxville, TN', 'east-network-expansion-knoxville', 0, -83.9207, 35.9606, 150, ST_SetSRID(ST_MakePoint(-83.9207, 35.9606), 4326)),
  (116, 'Chattanooga Distribution Center', 'Chattanooga, TN', 'east-network-expansion-chattanooga', 0, -85.3097, 35.0456, 150, ST_SetSRID(ST_MakePoint(-85.3097, 35.0456), 4326)),
  (117, 'Lexington Distribution Center', 'Lexington, KY', 'east-network-expansion-lexington', 0, -84.5037, 38.0406, 150, ST_SetSRID(ST_MakePoint(-84.5037, 38.0406), 4326)),
  (118, 'Fort Wayne Distribution Center', 'Fort Wayne, IN', 'east-network-expansion-fort-wayne', 0, -85.1394, 41.0793, 150, ST_SetSRID(ST_MakePoint(-85.1394, 41.0793), 4326)),
  (119, 'Toledo Distribution Center', 'Toledo, OH', 'east-network-expansion-toledo', 0, -83.5379, 41.6528, 150, ST_SetSRID(ST_MakePoint(-83.5379, 41.6528), 4326)),
  (120, 'Grand Rapids Distribution Center', 'Grand Rapids, MI', 'east-network-expansion-grand-rapids', 0, -85.6681, 42.9634, 150, ST_SetSRID(ST_MakePoint(-85.6681, 42.9634), 4326)),
  (121, 'Milwaukee Distribution Center', 'Milwaukee, WI', 'east-network-expansion-milwaukee', 0, -87.9065, 43.0389, 150, ST_SetSRID(ST_MakePoint(-87.9065, 43.0389), 4326)),
  (122, 'Huntsville Distribution Center', 'Huntsville, AL', 'east-network-expansion-huntsville', 0, -86.5861, 34.7304, 150, ST_SetSRID(ST_MakePoint(-86.5861, 34.7304), 4326)),
  (123, 'Greenville Distribution Center', 'Greenville, SC', 'east-network-expansion-greenville', 0, -82.3940, 34.8526, 150, ST_SetSRID(ST_MakePoint(-82.3940, 34.8526), 4326)),
  (124, 'Savannah Distribution Center', 'Savannah, GA', 'east-network-expansion-savannah', 0, -81.0998, 32.0809, 150, ST_SetSRID(ST_MakePoint(-81.0998, 32.0809), 4326)),
  (125, 'Tallahassee Distribution Center', 'Tallahassee, FL', 'east-network-expansion-tallahassee', 0, -84.2807, 30.4383, 150, ST_SetSRID(ST_MakePoint(-84.2807, 30.4383), 4326)),
  (126, 'Pensacola Distribution Center', 'Pensacola, FL', 'east-network-expansion-pensacola', 0, -87.2169, 30.4213, 150, ST_SetSRID(ST_MakePoint(-87.2169, 30.4213), 4326)),
  (127, 'Mobile Distribution Center', 'Mobile, AL', 'east-network-expansion-mobile', 0, -88.0399, 30.6954, 150, ST_SetSRID(ST_MakePoint(-88.0399, 30.6954), 4326)),
  (128, 'New Orleans Distribution Center', 'New Orleans, LA', 'east-network-expansion-new-orleans', 0, -90.0715, 29.9511, 150, ST_SetSRID(ST_MakePoint(-90.0715, 29.9511), 4326))
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
  16 + ((depots.id - 105) * 3) + series.n,
  depots.name || ' Linehaul ' || lpad(series.n::text, 2, '0'),
  26,
  depots.id
FROM locations AS depots
CROSS JOIN generate_series(1, 3) AS series(n)
WHERE depots.id BETWEEN 105 AND 128
ON CONFLICT (id) DO NOTHING;
