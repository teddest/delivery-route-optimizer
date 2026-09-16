-- Real Oakland and Berkeley address points from Alameda County Address Points.
-- Source: https://hub.arcgis.com/datasets/4610acbf49364583986d45ee4106cc3f
-- Selected by deterministic farthest-point sampling within each city.
INSERT INTO locations (id, name, address, source_id, demand, x, y, location) VALUES
  (33, 'Oakland Stop 01', '2915 Monticello Ave, Oakland, CA 94619', 'alameda-3', 2, -122.196624590758, 37.780705718318, ST_SetSRID(ST_MakePoint(-122.196624590758, 37.780705718318), 4326)),
  (34, 'Oakland Stop 02', '90 Burma Rd, Oakland, CA 94606', 'alameda-1586', 3, -122.302879304247, 37.822191745496, ST_SetSRID(ST_MakePoint(-122.302879304247, 37.822191745496), 4326)),
  (35, 'Oakland Stop 03', '7150 Norfolk Rd, Oakland, CA 94705', 'alameda-383', 4, -122.224487997947, 37.862177874251, ST_SetSRID(ST_MakePoint(-122.224487997947, 37.862177874251), 4326)),
  (36, 'Oakland Stop 04', '4722 Grass Valley Rd, Oakland, CA 94605', 'alameda-3583', 2, -122.120991180652, 37.751213051027, ST_SetSRID(ST_MakePoint(-122.120991180652, 37.751213051027), 4326)),
  (37, 'Oakland Stop 05', '336 Catron Dr, Oakland, CA 94603', 'alameda-4050', 3, -122.174223449842, 37.726874384202, ST_SetSRID(ST_MakePoint(-122.174223449842, 37.726874384202), 4326)),
  (38, 'Oakland Stop 06', '255 9th Ave Apt 626, Oakland, CA 94606', 'alameda-337', 4, -122.256409062934, 37.787919572411, ST_SetSRID(ST_MakePoint(-122.256409062934, 37.787919572411), 4326)),
  (39, 'Oakland Stop 07', '26 Eastwood Ct, Oakland, CA 94611', 'alameda-4093', 2, -122.186150645075, 37.835476303613, ST_SetSRID(ST_MakePoint(-122.186150645075, 37.835476303613), 4326)),
  (40, 'Oakland Stop 08', '439 49th St, Oakland, CA 94609', 'alameda-3417', 3, -122.260530345710, 37.835320192267, ST_SetSRID(ST_MakePoint(-122.260530345710, 37.835320192267), 4326)),
  (41, 'Oakland Stop 09', '7810 Sanford St, Oakland, CA 94605', 'alameda-691', 4, -122.154640236835, 37.773545599924, ST_SetSRID(ST_MakePoint(-122.154640236835, 37.773545599924), 4326)),
  (42, 'Oakland Stop 10', '1562 Trestle Glen Rd, Oakland, CA 94610', 'alameda-3621', 2, -122.223335179163, 37.810740398502, ST_SetSRID(ST_MakePoint(-122.223335179163, 37.810740398502), 4326)),
  (43, 'Berkeley Stop 11', '1080 Jones St Apt 106, Berkeley, CA 94710', 'alameda-16', 3, -122.295266748764, 37.875857552606, ST_SetSRID(ST_MakePoint(-122.295266748764, 37.875857552606), 4326)),
  (44, 'Berkeley Stop 12', '24 Vicente Rd, Berkeley, CA 94705', 'alameda-7457', 4, -122.234662183904, 37.854064726626, ST_SetSRID(ST_MakePoint(-122.234662183904, 37.854064726626), 4326)),
  (45, 'Berkeley Stop 13', '56 The Crescent, Berkeley, CA 94708', 'alameda-8966', 2, -122.254361372109, 37.894243186885, ST_SetSRID(ST_MakePoint(-122.254361372109, 37.894243186885), 4326)),
  (46, 'Berkeley Stop 14', '3398 Adeline St, Berkeley, CA 94703', 'alameda-2273', 3, -122.272666078549, 37.846879938995, ST_SetSRID(ST_MakePoint(-122.272666078549, 37.846879938995), 4326)),
  (47, 'Berkeley Stop 15', '468 Vincente Ave, Berkeley, CA 94707', 'alameda-6222', 4, -122.282633837942, 37.900047921789, ST_SetSRID(ST_MakePoint(-122.282633837942, 37.900047921789), 4326)),
  (48, 'Berkeley Stop 16', '2525 Durant Ave 2-8, Berkeley, CA 94704', 'alameda-6894', 2, -122.257767630953, 37.868248313548, ST_SetSRID(ST_MakePoint(-122.257767630953, 37.868248313548), 4326)),
  (49, 'Berkeley Stop 17', '751 Folger Ave, Berkeley, CA 94710', 'alameda-1779', 3, -122.292937066890, 37.849921036289, ST_SetSRID(ST_MakePoint(-122.292937066890, 37.849921036289), 4326)),
  (50, 'Berkeley Stop 18', '1332 Milvia St, Berkeley, CA 94709', 'alameda-9061', 4, -122.272243512836, 37.882258482886, ST_SetSRID(ST_MakePoint(-122.272243512836, 37.882258482886), 4326)),
  (51, 'Berkeley Stop 19', '201 University Ave 6, Berkeley, CA 94710', 'alameda-2104', 2, -122.312503183160, 37.865722041802, ST_SetSRID(ST_MakePoint(-122.312503183160, 37.865722041802), 4326)),
  (52, 'Berkeley Stop 20', '2319 Spaulding Ave, Berkeley, CA 94703', 'alameda-6789', 3, -122.279997013987, 37.865260172268, ST_SetSRID(ST_MakePoint(-122.279997013987, 37.865260172268), 4326))
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, source_id=EXCLUDED.source_id, demand=EXCLUDED.demand, x=EXCLUDED.x, y=EXCLUDED.y, location=EXCLUDED.location;
