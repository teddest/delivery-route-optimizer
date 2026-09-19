export type LinehaulDepot = {
  id: number;
  name: string;
  address: string | null;
  lng: number;
  lat: number;
  serviceRadiusMiles: number | null;
};

export type Shipment = {
  id: number;
  reference: string;
  originDepotId: number;
  destinationDepotId: number;
  pallets: number;
  weightLbs: number;
  deliveryDeadlineHours: number;
  status: "ready" | "planned" | "in_transit";
};

export type LinehaulVehicle = {
  id: number;
  name: string;
  capacityPallets: number;
  homeDepotId: number;
};

export type LinehaulRoute = {
  id: string;
  vehicleId: number;
  vehicleName: string;
  originDepotId: number;
  destinationDepotId: number;
  originName: string;
  destinationName: string;
  shipmentIds: number[];
  shipmentReferences: string[];
  pallets: number;
  weightLbs: number;
  distanceKm: number;
  durationMinutes: number;
  relayDepotIds: number[];
  relayNames: string[];
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
};
