import type {
  PropertyValuation,
} from "@/types/valuation";


export type PropertyType =


  | "Residential"
  | "Agricultural"
  | "Commercial";

export type InternetQuality =
  | "Poor"
  | "Fair"
  | "Good";

export type Terrain =
  | "Flat"
  | "Mixed"
  | "Sloped";

export type Slope =
  | "Low"
  | "Moderate"
  | "Steep";

export type Suitability =
  | "Low"
  | "Moderate"
  | "High";

export type VerificationStatus =
  | "verified"
  | "pending"
  | "not-checked";

export type PropertyVerification = {
  sellerIdentity: VerificationStatus;
  location: VerificationStatus;
  photos: VerificationStatus;
  ownershipEvidence: VerificationStatus;
  physicalInspection: VerificationStatus;
};

export type PropertyImage = {
  id: string;
  storagePath: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  url: string;
};

export type Property = {

  
  
  id: string;

  price: string;
  pricePkr: number;

  estimate: string;
  valuation: PropertyValuation;

  title: string;

  location: string;
  locationSlug: string;

  latitude: number | null;
  longitude: number | null;

  size: string;
  type: PropertyType;

  gradient: string;

  description: string;

  roadAccess: boolean;
  roadType: string;
  distanceToMainRoadM: number | null;

  waterAvailable: boolean;
  waterSource: string;

  electricityAvailable: boolean;
  irrigationAvailable: boolean;

  internetQuality: InternetQuality | null;

  terrain: Terrain | null;
  slope: Slope | null;

  residentialSuitability: Suitability | null;
  agriculturalSuitability: Suitability | null;

  sellerName: string;

  verification: PropertyVerification;
  images: PropertyImage[];
};

