export type Location = {
  id: number;
  name: string;
  demand: number;
  x: number;
  y: number;
  lng: number;
  lat: number;
};

export type Vehicle = {
  id: number;
  name: string;
  capacity: number;
};

export type Route = {
  vehicleId: number;
  vehicleName: string;
  stops: number[];
  load: number;
  distance: number;
};
