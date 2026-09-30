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

export type Property = {
  id: string;

  price: string;
  pricePkr: number;

  estimate: string;

  title: string;

  location: string;
  locationSlug: string;

  size: string;
  type: PropertyType;

  gradient: string;

  description: string;

  roadAccess: boolean;
  roadType: string;
  distanceToMainRoadM: number;

  waterAvailable: boolean;
  waterSource: string;

  electricityAvailable: boolean;
  irrigationAvailable: boolean;

  internetQuality: InternetQuality;

  terrain: Terrain;
  slope: Slope;

  residentialSuitability: Suitability;
  agriculturalSuitability: Suitability;

  sellerName: string;

  verification: PropertyVerification;
};