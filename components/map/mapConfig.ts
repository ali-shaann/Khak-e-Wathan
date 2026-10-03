import type {
  LatLngBoundsExpression,
  LatLngExpression,
} from "leaflet";


/*
  Khak-e-Wathan currently serves the Chitral region.

  These limits are intentionally a generous rectangular UX
  guardrail rather than a legal or cadastral boundary. They
  keep users from accidentally panning far away from Chitral
  while still leaving comfortable space around Upper and
  Lower Chitral.
*/

export const CHITRAL_LIMITS = {
  south: 35.05,
  west: 70.85,
  north: 37.15,
  east: 73.35,
} as const;


export const CHITRAL_CENTER: LatLngExpression = [
  36.22,
  72.1,
];


export const CHITRAL_MAX_BOUNDS: LatLngBoundsExpression = [
  [
    CHITRAL_LIMITS.south,
    CHITRAL_LIMITS.west,
  ],
  [
    CHITRAL_LIMITS.north,
    CHITRAL_LIMITS.east,
  ],
];


/*
  Slightly tighter overview used by reset buttons so the
  initial view feels focused rather than showing the entire
  guardrail rectangle.
*/
export const CHITRAL_OVERVIEW_BOUNDS: LatLngBoundsExpression = [
  [
    35.3,
    71.15,
  ],
  [
    37.0,
    73.05,
  ],
];


export const CHITRAL_MIN_ZOOM = 8;

export const CHITRAL_MAX_ZOOM = 18;


export function clampToChitral(
  lat: number,
  lng: number
) {
  return {
    lat: Math.min(
      CHITRAL_LIMITS.north,
      Math.max(
        CHITRAL_LIMITS.south,
        lat
      )
    ),

    lng: Math.min(
      CHITRAL_LIMITS.east,
      Math.max(
        CHITRAL_LIMITS.west,
        lng
      )
    ),
  };
}
