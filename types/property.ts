export type Property = {
  id: string;

  price: string;
  pricePkr: number;

  estimate: string;

  title: string;
  location: string;

  size: string;
  type: "Residential" | "Agricultural" | "Commercial";

  gradient: string;

  roadAccess: boolean;
  waterAvailable: boolean;
  electricityAvailable: boolean;
};