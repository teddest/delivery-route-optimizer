-- Ensure every distribution center has at least two outbound LTL shipments.
WITH ordered_depots AS (
  SELECT
    id,
    row_number() OVER (ORDER BY id) AS depot_number,
    count(*) OVER () AS depot_count
  FROM locations
  WHERE name LIKE '%Distribution Center'
), lanes AS (
  SELECT
    origin.id AS origin_id,
    next_depot.id AS next_destination_id,
    next_next_depot.id AS next_next_destination_id,
    origin.depot_number
  FROM ordered_depots AS origin
  JOIN ordered_depots AS next_depot
    ON next_depot.depot_number = (origin.depot_number % origin.depot_count) + 1
  JOIN ordered_depots AS next_next_depot
    ON next_next_depot.depot_number = ((origin.depot_number + 1) % origin.depot_count) + 1
)
INSERT INTO shipments (
  id,
  reference,
  origin_depot_id,
  destination_depot_id,
  pallets,
  weight_lbs,
  delivery_deadline_hours,
  status
)
SELECT
  1000 + ((depot_number - 1) * 2) + shipment_number,
  'NETWORK-' || lpad(depot_number::text, 3, '0') || '-' || shipment_number,
  origin_id,
  CASE WHEN shipment_number = 1 THEN next_destination_id ELSE next_next_destination_id END,
  CASE WHEN shipment_number = 1 THEN 6 ELSE 9 END,
  CASE WHEN shipment_number = 1 THEN 7200 ELSE 10800 END,
  72,
  'ready'
FROM lanes
CROSS JOIN generate_series(1, 2) AS generated(shipment_number)
ON CONFLICT (id) DO NOTHING;

-- Ensure every distribution center has at least five available linehaul vehicles.
WITH depot_counts AS (
  SELECT
    depots.id AS depot_id,
    depots.name AS depot_name,
    count(vehicles.id)::integer AS current_count
  FROM locations AS depots
  LEFT JOIN linehaul_vehicles AS vehicles ON vehicles.home_depot_id = depots.id
  WHERE depots.name LIKE '%Distribution Center'
  GROUP BY depots.id, depots.name
), missing_slots AS (
  SELECT
    depot_id,
    depot_name,
    slot
  FROM depot_counts
  CROSS JOIN LATERAL generate_series(current_count + 1, 5) AS generated(slot)
  WHERE current_count < 5
), numbered_slots AS (
  SELECT
    row_number() OVER (ORDER BY depot_id, slot) AS vehicle_number,
    depot_id,
    depot_name,
    slot
  FROM missing_slots
)
INSERT INTO linehaul_vehicles (id, name, capacity_pallets, home_depot_id)
SELECT
  2000 + (depot_id * 10) + slot,
  depot_name || ' Linehaul ' || lpad(slot::text, 2, '0'),
  26,
  depot_id
FROM numbered_slots
ON CONFLICT (id) DO NOTHING;
