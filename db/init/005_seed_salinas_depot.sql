-- Real Salinas address points from the City of Salinas Site Address Points layer.
-- Source: https://salinas-gis.ci.salinas.ca.us/arcgis/rest/services/Address/Site_Address_Points/FeatureServer/0
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS depot_id INTEGER NOT NULL DEFAULT 1 REFERENCES locations(id);
INSERT INTO locations (id, name, address, source_id, demand, x, y, location) VALUES
  (63, 'Salinas Distribution Center', '1107 PAJARO ST, Unit 6, Salinas, CA 93901', 'salinas-1', 0, -121.655820427498, 36.658448328160, ST_SetSRID(ST_MakePoint(-121.655820427498, 36.658448328160), 4326)),
  (64, 'Salinas Stop 01', '24665 FOOTHILL DR, Salinas, CA 93908', 'salinas-962', 2, -121.547536743936, 36.671609844225, ST_SetSRID(ST_MakePoint(-121.547536743936, 36.671609844225), 4326)),
  (65, 'Salinas Stop 02', '1191 ROCKHAVEN CT, Salinas, CA 93906', 'salinas-209', 3, -121.607014046469, 36.708099851154, ST_SetSRID(ST_MakePoint(-121.607014046469, 36.708099851154), 4326)),
  (66, 'Salinas Stop 03', '70 ARMSTRONG RD, Salinas, CA 93908', 'salinas-164', 4, -121.708120411615, 36.690502506103, ST_SetSRID(ST_MakePoint(-121.708120411615, 36.690502506103), 4326)),
  (67, 'Salinas Stop 04', '137 AUTO CENTER CIR, Salinas, CA 93907', 'salinas-366', 2, -121.663326617134, 36.721263950818, ST_SetSRID(ST_MakePoint(-121.663326617134, 36.721263950818), 4326)),
  (68, 'Salinas Stop 05', '2120 ALISAL RD, Salinas, CA 93908', 'salinas-451', 3, -121.592903879506, 36.660210076011, ST_SetSRID(ST_MakePoint(-121.592903879506, 36.660210076011), 4326)),
  (69, 'Salinas Stop 06', '16 NATIVIDAD RD, Unit 7, Salinas, CA 93906', 'salinas-216', 4, -121.642313815249, 36.692170664298, ST_SetSRID(ST_MakePoint(-121.642313815249, 36.692170664298), 4326)),
  (70, 'Salinas Stop 07', '103 HARKINS RD, Salinas, CA 93908', 'salinas-368', 2, -121.642396499073, 36.628306341269, ST_SetSRID(ST_MakePoint(-121.642396499073, 36.628306341269), 4326)),
  (71, 'Salinas Stop 08', '1030 FAIRVIEW AVE, Unit 114, Salinas, CA 93905', 'salinas-692', 3, -121.626292755454, 36.666057309749, ST_SetSRID(ST_MakePoint(-121.626292755454, 36.666057309749), 4326)),
  (72, 'Salinas Stop 09', '36 QUAIL RUN CIR, Unit 100-M, Salinas, CA 93907', 'salinas-108', 4, -121.671352587385, 36.685475119708, ST_SetSRID(ST_MakePoint(-121.671352587385, 36.685475119708), 4326)),
  (73, 'Salinas Stop 10', '10 HARRIS PL, Salinas, CA 93901', 'salinas-927', 2, -121.613300203152, 36.641466206406, ST_SetSRID(ST_MakePoint(-121.613300203152, 36.641466206406), 4326))
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, source_id=EXCLUDED.source_id, demand=EXCLUDED.demand, x=EXCLUDED.x, y=EXCLUDED.y, location=EXCLUDED.location;

UPDATE vehicles SET depot_id = 1 WHERE depot_id IS NULL OR id <= 5;
INSERT INTO vehicles (id, name, capacity, depot_id) VALUES
  (6, 'Salinas Truck 01', 100, 63),
  (7, 'Salinas Truck 02', 100, 63),
  (8, 'Salinas Truck 03', 100, 63)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, capacity=EXCLUDED.capacity, depot_id=EXCLUDED.depot_id;
