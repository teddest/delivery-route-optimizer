export type Location = {
  id: number;
  name: string;
  address: string | null;
  sourceId: string | null;
  demand: number;
  serviceRadiusMiles: number | null;
  x: number;
  y: number;
  lng: number;
  lat: number;
};

export type Vehicle = {
  id: number;
  name: string;
  capacity: number;
  depotId: number;

};

export type Route = {
  vehicleId: number;
  depotId: number;
  depotName: string;
  vehicleName: string;
  stops: number[];
  load: number;
  distance: number;
  durationMinutes: number;
  geometry?: {
    type: "LineString";
    coordinates: [number, number][];
  };
};
