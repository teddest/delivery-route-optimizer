-- Real San Luis Obispo and Fresno address points.
-- San Luis Obispo: City of SLO Address Points FeatureServer.
-- Fresno: OpenStreetMap address-tagged points (ODbL data).
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS depot_id INTEGER NOT NULL DEFAULT 1 REFERENCES locations(id);
INSERT INTO locations (id, name, address, source_id, demand, x, y, location) VALUES
  (99, 'San Luis Obispo Distribution Center', '1824 Castillo, San Luis Obispo, CA 93405', 'slo-1', 0, -120.705170287407, 35.263484065295, ST_SetSRID(ST_MakePoint(-120.705170287407, 35.263484065295), 4326)),
  (110, 'Fresno Distribution Center', '2617 S. Fowler Avenue, Fresno, CA 93725', 'osm-node-358769669', 0, -119.681804700000, 36.698561200000, ST_SetSRID(ST_MakePoint(-119.681804700000, 36.698561200000), 4326)),
  (100, 'San Luis Obispo Stop 01', '10 Villa, San Luis Obispo, CA 93401', 'slo-956', 2, -120.676532724576, 35.242686572707, ST_SetSRID(ST_MakePoint(-120.676532724576, 35.242686572707), 4326)),
  (101, 'San Luis Obispo Stop 02', '100 Madonna, San Luis Obispo, CA 93405', 'slo-732', 3, -120.675691604967, 35.264921160473, ST_SetSRID(ST_MakePoint(-120.675691604967, 35.264921160473), 4326)),
  (102, 'San Luis Obispo Stop 03', '11712 Los Osos Valley, San Luis Obispo, CA 93405', 'slo-728', 4, -120.689342242233, 35.255405876449, ST_SetSRID(ST_MakePoint(-120.689342242233, 35.255405876449), 4326)),
  (103, 'San Luis Obispo Stop 04', '1132 Vista Del Lago, San Luis Obispo, CA 93405', 'slo-195', 2, -120.694262172569, 35.265030935853, ST_SetSRID(ST_MakePoint(-120.694262172569, 35.265030935853), 4326)),
  (104, 'San Luis Obispo Stop 05', '1957 Partridge, San Luis Obispo, CA 93405', 'slo-159', 3, -120.699064191184, 35.255798952645, ST_SetSRID(ST_MakePoint(-120.699064191184, 35.255798952645), 4326)),
  (105, 'San Luis Obispo Stop 06', '1605 Calle Joaquin, San Luis Obispo, CA 93405', 'slo-879', 4, -120.685204206214, 35.243817390608, ST_SetSRID(ST_MakePoint(-120.685204206214, 35.243817390608), 4326)),
  (106, 'San Luis Obispo Stop 07', '1502 Oceanaire, San Luis Obispo, CA 93405', 'slo-501', 2, -120.685634739527, 35.261880644391, ST_SetSRID(ST_MakePoint(-120.685634739527, 35.261880644391), 4326)),
  (107, 'San Luis Obispo Stop 08', '806 Vista Del Brisa, San Luis Obispo, CA 93405', 'slo-833', 3, -120.700683931665, 35.268439777727, ST_SetSRID(ST_MakePoint(-120.700683931665, 35.268439777727), 4326)),
  (108, 'San Luis Obispo Stop 09', '1609 Karen, San Luis Obispo, CA 93405', 'slo-86', 4, -120.699055367436, 35.261549331660, ST_SetSRID(ST_MakePoint(-120.699055367436, 35.261549331660), 4326)),
  (109, 'San Luis Obispo Stop 10', '333 Madonna, San Luis Obispo, CA 93405', 'slo-731', 2, -120.674769098512, 35.259280941056, ST_SetSRID(ST_MakePoint(-120.674769098512, 35.259280941056), 4326)),
  (111, 'Fresno Stop 01', '30800 Avenue 12, Fresno, CA 93638', 'osm-node-9760341440', 2, -119.984948100000, 36.922345100000, ST_SetSRID(ST_MakePoint(-119.984948100000, 36.922345100000), 4326)),
  (112, 'Fresno Stop 02', '14439 North Friant Road, Fresno, CA 93626', 'osm-way-1187778254', 3, -119.731042600000, 36.944596900000, ST_SetSRID(ST_MakePoint(-119.731042600000, 36.944596900000), 4326)),
  (113, 'Fresno Stop 03', '925 North Cornelia Avenue, Fresno, CA 93706', 'osm-way-61620363', 4, -119.881224700000, 36.749310300000, ST_SetSRID(ST_MakePoint(-119.881224700000, 36.749310300000), 4326)),
  (114, 'Fresno Stop 04', '10505 East Bullard Avenue, Fresno, CA ', 'osm-node-12767643727', 2, -119.600227600000, 36.822543500000, ST_SetSRID(ST_MakePoint(-119.600227600000, 36.822543500000), 4326)),
  (115, 'Fresno Stop 05', '1535 East Shaw Avenue, Fresno, CA ', 'osm-way-61464422', 3, -119.760090000000, 36.808113500000, ST_SetSRID(ST_MakePoint(-119.760090000000, 36.808113500000), 4326)),
  (116, 'Fresno Stop 06', '5385 South Elm Avenue, Fresno, CA ', 'osm-way-1230901586', 4, -119.791417800000, 36.657308300000, ST_SetSRID(ST_MakePoint(-119.791417800000, 36.657308300000), 4326)),
  (117, 'Fresno Stop 07', '36140 Avenue 9, Fresno, CA 93636', 'osm-node-13954113933', 2, -119.892790600000, 36.879663600000, ST_SetSRID(ST_MakePoint(-119.892790600000, 36.879663600000), 4326)),
  (118, 'Fresno Stop 08', '10480 Jefferson Ave, Fresno, CA ', 'osm-way-352414152', 3, -119.600310600000, 36.656313000000, ST_SetSRID(ST_MakePoint(-119.600310600000, 36.656313000000), 4326)),
  (119, 'Fresno Stop 09', '5161 East Serena Avenue, Fresno, CA ', 'osm-way-1258510301', 4, -119.689337400000, 36.864642200000, ST_SetSRID(ST_MakePoint(-119.689337400000, 36.864642200000), 4326)),
  (120, 'Fresno Stop 10', '3275 N Rolinda Ave, Fresno, Fresno, CA 93723', 'osm-node-13271943569', 2, -119.961613800000, 36.782732400000, ST_SetSRID(ST_MakePoint(-119.961613800000, 36.782732400000), 4326))
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, source_id=EXCLUDED.source_id, demand=EXCLUDED.demand, x=EXCLUDED.x, y=EXCLUDED.y, location=EXCLUDED.location;

INSERT INTO vehicles (id, name, capacity, depot_id) VALUES
  (19, 'San Luis Obispo Truck 01', 100, 99),
  (20, 'San Luis Obispo Truck 02', 100, 99),
  (21, 'San Luis Obispo Truck 03', 100, 99),
  (22, 'Fresno Truck 01', 100, 110),
  (23, 'Fresno Truck 02', 100, 110),
  (24, 'Fresno Truck 03', 100, 110)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, capacity=EXCLUDED.capacity, depot_id=EXCLUDED.depot_id;
