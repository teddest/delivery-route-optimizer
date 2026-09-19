-- Real Southern California address points from public civic and OSM datasets.
-- Oxnard: OpenStreetMap address-tagged points (ODbL data).
-- Los Angeles: LA County CAMS address points.
-- Riverside: Riverside County address points.
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS depot_id INTEGER NOT NULL DEFAULT 1 REFERENCES locations(id);
INSERT INTO locations (id, name, address, source_id, demand, x, y, location) VALUES
  (74, 'Los Angeles Distribution Center', '500 Spring Street, Los Angeles, CA 90013', 'la-1675483', 0, -118.249602406796, 34.047207455299, ST_SetSRID(ST_MakePoint(-118.249602406796, 34.047207455299), 4326)),
  (75, 'Oxnard Stop 01', '463 West Pleasant Valley Road, Oxnard, CA 93033', 'osm-node-358847455', 2, -119.182859200000, 34.155139500000, ST_SetSRID(ST_MakePoint(-119.182859200000, 34.155139500000), 4326)),
  (76, 'Oxnard Stop 02', '1901 Spinnaker Drive, Oxnard, CA 93001', 'osm-way-37842945', 3, -119.266565000000, 34.248496400000, ST_SetSRID(ST_MakePoint(-119.266565000000, 34.248496400000), 4326)),
  (77, 'Oxnard Stop 03', '4444 Central Avenue, Oxnard, CA 93010', 'osm-way-627892633', 4, -119.103147800000, 34.222695000000, ST_SetSRID(ST_MakePoint(-119.103147800000, 34.222695000000), 4326)),
  (78, 'Oxnard Stop 04', '2790 North Ventura Road, Oxnard, CA 93036', 'osm-node-13984549215', 2, -119.183654500000, 34.242932900000, ST_SetSRID(ST_MakePoint(-119.183654500000, 34.242932900000), 4326)),
  (79, 'Oxnard Stop 05', '3803 Dufau Road, Oxnard, CA 93033', 'osm-node-7734067189', 3, -119.116805600000, 34.151884700000, ST_SetSRID(ST_MakePoint(-119.116805600000, 34.151884700000), 4326)),
  (80, 'Oxnard Stop 06', '1031 Harbor Boulevard, Oxnard, CA 93035', 'osm-node-13140307906', 4, -119.239340500000, 34.190974800000, ST_SetSRID(ST_MakePoint(-119.239340500000, 34.190974800000), 4326)),
  (81, 'Oxnard Stop 07', '1850 Eastman Avenue, Oxnard, CA 93030', 'osm-node-13300738837', 2, -119.157052800000, 34.197975600000, ST_SetSRID(ST_MakePoint(-119.157052800000, 34.197975600000), 4326)),
  (82, 'Oxnard Stop 08', '4880 Colt Street, Oxnard, CA 93003', 'osm-way-1187653182', 3, -119.225014100000, 34.249259400000, ST_SetSRID(ST_MakePoint(-119.225014100000, 34.249259400000), 4326)),
  (83, 'Los Angeles Stop 09', '500 Spring Street, Los Angeles, CA 90013', 'la-1675483', 4, -118.249602406796, 34.047207455299, ST_SetSRID(ST_MakePoint(-118.249602406796, 34.047207455299), 4326)),
  (84, 'Los Angeles Stop 10', '11180 Iverson Lane, Los Angeles, CA 91311', 'la-726996', 2, -118.608928845891, 34.276889264699, ST_SetSRID(ST_MakePoint(-118.608928845891, 34.276889264699), 4326)),
  (85, 'Los Angeles Stop 11', '210 Whalers Walk, Los Angeles, CA 90731', 'la-840396', 3, -118.280266756106, 33.718327746457, ST_SetSRID(ST_MakePoint(-118.280266756106, 33.718327746457), 4326)),
  (86, 'Los Angeles Stop 12', '27 Latimer Road, Los Angeles, CA 90402', 'la-813967', 4, -118.511559849808, 34.044108210433, ST_SetSRID(ST_MakePoint(-118.511559849808, 34.044108210433), 4326)),
  (87, 'Los Angeles Stop 13', '11324 Riverwood Drive, Los Angeles, CA 91040', 'la-425283', 2, -118.318652707225, 34.276342400256, ST_SetSRID(ST_MakePoint(-118.318652707225, 34.276342400256), 4326)),
  (88, 'Los Angeles Stop 14', '6101 Imperial Highway, Los Angeles, CA 90045', 'la-743828', 3, -118.392542761524, 33.932367326537, ST_SetSRID(ST_MakePoint(-118.392542761524, 33.932367326537), 4326)),
  (89, 'Los Angeles Stop 15', '8866 Burnet Avenue, Los Angeles, CA 91343', 'la-826430', 4, -118.463116926555, 34.231353150451, ST_SetSRID(ST_MakePoint(-118.463116926555, 34.231353150451), 4326)),
  (90, 'Los Angeles Stop 16', '3900 Lankershim Boulevard, Los Angeles, CA 91608', 'la-705830', 2, -118.359746137856, 34.139225536473, ST_SetSRID(ST_MakePoint(-118.359746137856, 34.139225536473), 4326)),
  (91, 'Riverside Stop 17', '3641 6TH ST, RIVERSIDE, CA 92501, Riverside, CA 92501', 'riverside-16019', 3, -117.372294375123, 33.983738616150, ST_SetSRID(ST_MakePoint(-117.372294375123, 33.983738616150), 4326)),
  (92, 'Riverside Stop 18', '13215 APRIL DR, RIVERSIDE, CA 92503, Riverside, CA 92503', 'riverside-521977', 4, -117.508224016994, 33.874574168066, ST_SetSRID(ST_MakePoint(-117.508224016994, 33.874574168066), 4326)),
  (93, 'Riverside Stop 19', '25011 GLORIA ST, RIVERSIDE, CA 92504, Riverside, CA 92504', 'riverside-117201', 2, -117.225546327805, 33.919797512410, ST_SetSRID(ST_MakePoint(-117.225546327805, 33.919797512410), 4326)),
  (94, 'Riverside Stop 20', '19410 HARLEY JOHN RD, RIVERSIDE, CA 92504, Riverside, CA 92504', 'riverside-498810', 3, -117.355576829593, 33.837877466827, ST_SetSRID(ST_MakePoint(-117.355576829593, 33.837877466827), 4326)),
  (95, 'Riverside Stop 21', '4261 CAMBELL ST, RIVERSIDE, CA 92509, Riverside, CA 92509', 'riverside-414120', 4, -117.494275683127, 34.010271900353, ST_SetSRID(ST_MakePoint(-117.494275683127, 34.010271900353), 4326)),
  (96, 'Riverside Stop 22', '7916 PIGEON PASS RD, RIVERSIDE, CA 92507, Riverside, CA 92507', 'riverside-485552', 2, -117.290926968855, 34.007266655868, ST_SetSRID(ST_MakePoint(-117.290926968855, 34.007266655868), 4326)),
  (97, 'Riverside Stop 23', '475 ALESSANDRO BLVD, RIVERSIDE, CA 92508, Riverside, CA 92508', 'riverside-195255', 3, -117.323440593940, 33.914163754067, ST_SetSRID(ST_MakePoint(-117.323440593940, 33.914163754067), 4326)),
  (98, 'Riverside Stop 24', '6401 INDUSTRIAL AVE, RIVERSIDE, CA 92504, Riverside, CA 92504', 'riverside-120821', 4, -117.439555701253, 33.966153144626, ST_SetSRID(ST_MakePoint(-117.439555701253, 33.966153144626), 4326))
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, source_id=EXCLUDED.source_id, demand=EXCLUDED.demand, x=EXCLUDED.x, y=EXCLUDED.y, location=EXCLUDED.location;

INSERT INTO vehicles (id, name, capacity, depot_id) VALUES
  (9, 'Los Angeles Truck 01', 100, 74),
  (10, 'Los Angeles Truck 02', 100, 74),
  (11, 'Los Angeles Truck 03', 100, 74),
  (12, 'Los Angeles Truck 04', 100, 74),
  (13, 'Los Angeles Truck 05', 100, 74),
  (14, 'Los Angeles Truck 06', 100, 74),
  (15, 'Los Angeles Truck 07', 100, 74),
  (16, 'Los Angeles Truck 08', 100, 74),
  (17, 'Los Angeles Truck 09', 100, 74),
  (18, 'Los Angeles Truck 10', 100, 74)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, capacity=EXCLUDED.capacity, depot_id=EXCLUDED.depot_id;
