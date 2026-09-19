-- Real Santa Clara address points from the City of Santa Clara active addresses layer.
-- Source: https://map.santaclaraca.gov/maps/rest/services/OPENDATA/CSCAddress_Active/MapServer/0
-- Selected by deterministic farthest-point sampling for map coverage.
INSERT INTO locations (id, name, address, source_id, demand, x, y, location) VALUES
  (53, 'Santa Clara Stop 01', '2958 Chromite Drive, Santa Clara, CA 95051', 'santaclara-198243541', 2, -121.980696785253, 37.365698913764, ST_SetSRID(ST_MakePoint(-121.980696785253, 37.365698913764), 4326)),
  (54, 'Santa Clara Stop 02', '1 Alviso Street, Santa Clara, CA 95050', 'santaclara-198243813', 3, -121.934095788734, 37.338095874719, ST_SetSRID(ST_MakePoint(-121.934095788734, 37.338095874719), 4326)),
  (55, 'Santa Clara Stop 03', '416 Hemlock Court, Santa Clara, CA 95054', 'santaclara-198244034', 4, -121.941166625479, 37.394700676785, ST_SetSRID(ST_MakePoint(-121.941166625479, 37.394700676785), 4326)),
  (56, 'Santa Clara Stop 04', '5239 Stevens Creek Boulevard, Santa Clara, CA 95051', 'santaclara-198243922', 2, -121.994586189248, 37.323852736790, ST_SetSRID(ST_MakePoint(-121.994586189248, 37.323852736790), 4326)),
  (57, 'Santa Clara Stop 05', '3051 Tasman Drive, Santa Clara, CA 95054', 'santaclara-198243571', 3, -121.981901296095, 37.403503207552, ST_SetSRID(ST_MakePoint(-121.981901296095, 37.403503207552), 4326)),
  (58, 'Santa Clara Stop 06', '3585 Stevens Creek Boulevard, Santa Clara, CA 95050', 'santaclara-198244278', 4, -121.962625926051, 37.323439676548, ST_SetSRID(ST_MakePoint(-121.962625926051, 37.323439676548), 4326)),
  (59, 'Santa Clara Stop 07', '2495 Lafayette Street, Santa Clara, CA 95050', 'santaclara-198243869', 2, -121.949988065626, 37.365713993042, ST_SetSRID(ST_MakePoint(-121.949988065626, 37.365713993042), 4326)),
  (60, 'Santa Clara Stop 08', '1311 Karmen Court, Santa Clara, CA 95051', 'santaclara-198244193', 3, -121.999793982755, 37.349261338503, ST_SetSRID(ST_MakePoint(-121.999793982755, 37.349261338503), 4326)),
  (61, 'Santa Clara Stop 09', '1156 Block Drive, Santa Clara, CA 95050', 'santaclara-198243865', 4, -121.964087382051, 37.346909713879, ST_SetSRID(ST_MakePoint(-121.964087382051, 37.346909713879), 4326)),
  (62, 'Santa Clara Stop 10', '3833 Kifer Road, Santa Clara, CA 95051', 'santaclara-198243724', 2, -122.002200250619, 37.374030998410, ST_SetSRID(ST_MakePoint(-122.002200250619, 37.374030998410), 4326))
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, source_id=EXCLUDED.source_id, demand=EXCLUDED.demand, x=EXCLUDED.x, y=EXCLUDED.y, location=EXCLUDED.location;
