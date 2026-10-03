"use client";

import {
  useEffect,
  useMemo,
} from "react";

import {
  createPortal,
} from "react-dom";

import Link from "next/link";

import L from "leaflet";

import {
  MapContainer,
  Marker,
  Popup,
  
  TileLayer,
  useMap,
} from "react-leaflet";

import {
  Property,
} from "@/types/property";

import {
  CHITRAL_CENTER,
  CHITRAL_MAX_BOUNDS,
  CHITRAL_MAX_ZOOM,
  CHITRAL_MIN_ZOOM,
  CHITRAL_OVERVIEW_BOUNDS,
} from "@/components/map/mapConfig";


type MappedProperty =
  Property & {
    latitude: number;
    longitude: number;
  };


export default function PropertyMap({
  properties,
  selectedPropertyId = null,
  onSelectProperty,
  contextLabel = "Chitral",
}: {
  properties:
    Property[];

  selectedPropertyId?:
    string | null;

  onSelectProperty?:
    (
      propertyId:
        string | null
    ) => void;

  contextLabel?:
    string;
}) {
  const mappedProperties =
    useMemo(
      () =>
        properties.filter(
          (
            property
          ): property is MappedProperty =>
            property.latitude !==
              null &&
            property.longitude !==
              null
        ),
      [
        properties,
      ]
    );


  return (
    <div className="relative h-full min-h-[500px] w-full overflow-hidden bg-slate-100">

      <MapContainer
        center={
          CHITRAL_CENTER
        }
        zoom={
          CHITRAL_MIN_ZOOM
        }
        minZoom={
          CHITRAL_MIN_ZOOM
        }
        maxZoom={
          CHITRAL_MAX_ZOOM
        }
        maxBounds={
          CHITRAL_MAX_BOUNDS
        }
        maxBoundsViscosity={1}
        scrollWheelZoom
        className="h-full min-h-[500px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <MapViewController
          properties={
            mappedProperties
          }
          selectedPropertyId={
            selectedPropertyId
          }
        />


        <MapOverlayControls
          properties={
            mappedProperties
          }
          contextLabel={
            contextLabel
          }
          onResetSelection={() =>
            onSelectProperty?.(
              null
            )
          }
        />


        {mappedProperties.map(
          (
            property
          ) => {
            const selected =
              property.id ===
              selectedPropertyId;


            return (
              <Marker
                key={
                  property.id
                }
                position={[
                  property.latitude,
                  property.longitude,
                ]}
                icon={
                  createPriceIcon(
                    property.pricePkr,
                    selected
                  )
                }
                eventHandlers={{
                  click() {
                    onSelectProperty?.(
                      property.id
                    );
                  },
                }}
              >
                <Popup
                  minWidth={240}
                >
                  <div className="py-1">

                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      {
                        property.type
                      }
                    </p>


                    <h3 className="mt-1 text-base font-bold text-slate-950">
                      {
                        property.title
                      }
                    </h3>


                    <p className="mt-1 text-sm text-slate-500">
                      {
                        property.location
                      }, Chitral
                    </p>


                    <p className="mt-3 text-lg font-bold text-slate-950">
                      {
                        property.price
                      }
                    </p>


                    <div className="mt-3 flex flex-wrap gap-1.5">

                      <MapBadge
                        text={
                          property.size
                        }
                      />

                      {property.roadAccess && (
                        <MapBadge
                          text="Road"
                        />
                      )}

                      {property.waterAvailable && (
                        <MapBadge
                          text="Water"
                        />
                      )}

                      {property.electricityAvailable && (
                        <MapBadge
                          text="Power"
                        />
                      )}
                    </div>


                    <div className="mt-4 border-t border-slate-100 pt-3">

                      <Link
                        href={`/properties/${property.id}`}
                        className="font-semibold text-slate-950 transition hover:text-emerald-700"
                      >
                        View Property Passport →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
        )}
      </MapContainer>
    </div>
  );
}


/* ============================================================
   VIEW CONTROLLER
============================================================ */

function MapViewController({
  properties,
  selectedPropertyId,
}: {
  properties:
    MappedProperty[];

  selectedPropertyId:
    string | null;
}) {
  const map =
    useMap();


  useEffect(
    () => {
      const selected =
        selectedPropertyId
          ? properties.find(
              (
                property
              ) =>
                property.id ===
                selectedPropertyId
            )
          : null;


      if (selected) {
        map.setView(
          [
            selected.latitude,
            selected.longitude,
          ],
          14,
          {
            animate:
              true,
          }
        );

        return;
      }


      focusMap(
        map,
        properties,
        true
      );
    },
    [
      map,
      properties,
      selectedPropertyId,
    ]
  );


  return null;
}


/* ============================================================
   MAP OVERLAY
============================================================ */

function MapOverlayControls({
  properties,
  contextLabel,
  onResetSelection,
}: {
  properties:
    MappedProperty[];

  contextLabel:
    string;

  onResetSelection:
    () => void;
}) {
  const map =
    useMap();

  const mapContainer =
    map.getContainer();


  return createPortal(
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-start justify-between gap-3 p-3 sm:p-4">

      <div className="pointer-events-auto rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2.5 shadow-lg backdrop-blur-md">

        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
          {
            contextLabel
          } map
        </p>


        <p className="mt-0.5 text-xs font-medium text-slate-600">
          {properties.length ===
          0
            ? "No mapped results"
            : `${properties.length} mapped ${
                properties.length ===
                1
                  ? "property"
                  : "properties"
              }`}
        </p>
      </div>


      <button
        type="button"
        onPointerDown={(
          event
        ) =>
          event.stopPropagation()
        }
        onClick={() => {
          onResetSelection();

          focusMap(
            map,
            properties,
            true
          );
        }}
        className="pointer-events-auto rounded-full border border-white/80 bg-white/95 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950"
      >
        Reset view
      </button>
    </div>,
    mapContainer
  );
}


/* ============================================================
   FOCUS HELPERS
============================================================ */

function focusMap(
  map:
    L.Map,
  properties:
    MappedProperty[],
  animate:
    boolean
) {
  if (
    properties.length ===
    0
  ) {
    map.fitBounds(
      CHITRAL_OVERVIEW_BOUNDS,
      {
        padding: [
          30,
          30,
        ],
        maxZoom:
          CHITRAL_MIN_ZOOM,
        animate,
      }
    );

    return;
  }


  if (
    properties.length ===
    1
  ) {
    map.setView(
      [
        properties[0].latitude,
        properties[0].longitude,
      ],
      14,
      {
        animate,
      }
    );

    return;
  }


  const bounds =
    L.latLngBounds(
      properties.map(
        (
          property
        ) => [
          property.latitude,
          property.longitude,
        ]
      )
    );


  map.fitBounds(
    bounds,
    {
      padding: [
        52,
        52,
      ],
      maxZoom: 14,
      animate,
    }
  );
}


/* ============================================================
   MARKER
============================================================ */

function createPriceIcon(
  pricePkr:
    number,
  selected:
    boolean
) {
  const label =
    formatMarkerPrice(
      pricePkr
    );


  const background =
    selected
      ? "#059669"
      : "#020617";


  const shadow =
    selected
      ? "0 10px 28px rgba(5,150,105,0.38)"
      : "0 8px 24px rgba(15,23,42,0.25)";


  return L.divIcon({
    className: "",

    html: `
      <div
        style="
          display:flex;
          align-items:center;
          justify-content:center;
          min-width:54px;
          height:34px;
          padding:0 10px;
          border-radius:9999px;
          background:${background};
          color:white;
          font-size:12px;
          font-weight:700;
          white-space:nowrap;
          box-shadow:${shadow};
          border:2px solid rgba(255,255,255,0.94);
          transition:transform .2s ease, background .2s ease;
          transform:${selected ? "scale(1.08)" : "scale(1)"};
        "
      >
        ${label}
      </div>
    `,

    iconSize: [
      64,
      34,
    ],

    iconAnchor: [
      32,
      17,
    ],

    popupAnchor: [
      0,
      -22,
    ],
  });
}


function formatMarkerPrice(
  pricePkr:
    number
) {
  if (
    pricePkr >=
    10_000_000
  ) {
    const crore =
      pricePkr /
      10_000_000;

    return `${formatNumber(
      crore
    )}Cr`;
  }


  const lakh =
    pricePkr /
    100_000;

  return `${formatNumber(
    lakh
  )}L`;
}


function formatNumber(
  value:
    number
) {
  return Number.isInteger(
    value
  )
    ? value.toString()
    : value.toFixed(
        1
      );
}


function MapBadge({
  text,
}: {
  text:
    string;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
      {
        text
      }
    </span>
  );
}
