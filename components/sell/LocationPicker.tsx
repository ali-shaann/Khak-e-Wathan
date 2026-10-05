"use client";

import {
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  divIcon,
} from "leaflet";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import {
  CHITRAL_CENTER,
  CHITRAL_MAX_BOUNDS,
  CHITRAL_MAX_ZOOM,
  CHITRAL_MIN_ZOOM,
  CHITRAL_OVERVIEW_BOUNDS,
  clampToChitral,
} from "@/components/map/mapConfig";


const markerIcon =
  divIcon({
    className: "",

    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #0f172a;
        border: 4px solid white;
        border-radius: 9999px;
        box-shadow: 0 6px 18px rgba(15,23,42,.38);
      "></div>
    `,

    iconSize: [
      24,
      24,
    ],

    iconAnchor: [
      12,
      12,
    ],
  });


export default function LocationPicker({
  initialLatitude = null,
  initialLongitude = null,
}: {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
}) {
  const [
    position,
    setPosition,
  ] =
    useState<{
      lat: number;
      lng: number;
    } | null>(() => {
      if (
        initialLatitude ===
          null ||
        initialLongitude ===
          null
      ) {
        return null;
      }


      return clampToChitral(
        initialLatitude,
        initialLongitude
      );
    });


  return (
    <div>

      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 shadow-sm">

        <MapContainer
          center={
            position
              ? [
                  position.lat,
                  position.lng,
                ]
              : CHITRAL_CENTER
          }
          zoom={
            position
              ? 14
              : CHITRAL_MIN_ZOOM
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
          scrollWheelZoom={false}
          className="h-[420px] w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          <PickerOverlay />


          <MapClickHandler
            position={
              position
            }
            setPosition={
              setPosition
            }
          />
        </MapContainer>
      </div>


      <input
        type="hidden"
        name="latitude"
        value={
          position?.lat ??
          ""
        }
      />


      <input
        type="hidden"
        name="longitude"
        value={
          position?.lng ??
          ""
        }
      />


      {position ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">

          <div className="flex items-start gap-3">

            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm text-emerald-700">
              ✓
            </div>


            <div>

              <p className="text-sm font-semibold text-emerald-900">
                Approximate location selected
              </p>


              <p className="mt-1 text-xs leading-5 text-emerald-700">
                {position.lat.toFixed(
                  6
                )},{" "}
                {position.lng.toFixed(
                  6
                )}
              </p>


              <p className="mt-1 text-xs text-emerald-700/80">
                Drag the marker if you want to fine-tune the position.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">

          <p className="text-sm font-semibold text-slate-700">
            Choose the approximate property location
          </p>


          <p className="mt-1 text-xs leading-5 text-slate-500">
            The map is limited to the Chitral region. Click anywhere
            on the map to place a marker.
          </p>
        </div>
      )}
    </div>
  );
}


function PickerOverlay() {
  const map =
    useMap();

  const mapContainer =
    map.getContainer();


  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-[1000]">

      <div className="absolute bottom-3 left-3 max-w-[220px] rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2.5 shadow-lg backdrop-blur-md">

        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
          Chitral only
        </p>

        <p className="mt-0.5 text-xs text-slate-600">
          Click to place the property
        </p>
      </div>


      <button
        type="button"
        onPointerDown={(
          event
        ) =>
          event.stopPropagation()
        }
        onClick={() =>
          map.fitBounds(
            CHITRAL_OVERVIEW_BOUNDS,
            {
              padding: [
                24,
                24,
              ],
              maxZoom:
                CHITRAL_MIN_ZOOM,
              animate:
                true,
            }
          )
        }
        className="pointer-events-auto absolute right-3 top-3 rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:text-slate-950"
      >
        Reset map
      </button>
    </div>,
    mapContainer
  );
}


function MapClickHandler({
  position,
  setPosition,
}: {
  position: {
    lat: number;
    lng: number;
  } | null;

  setPosition:
    React.Dispatch<
      React.SetStateAction<{
        lat: number;
        lng: number;
      } | null>
    >;
}) {
  useMapEvents({
    click(
      event
    ) {
      const safePosition =
        clampToChitral(
          event.latlng.lat,
          event.latlng.lng
        );


      setPosition(
        safePosition
      );
    },
  });


  if (!position) {
    return null;
  }


  return (
    <Marker
      position={[
        position.lat,
        position.lng,
      ]}
      icon={
        markerIcon
      }
      draggable
      autoPan
      eventHandlers={{
        dragend(
          event
        ) {
          const marker =
            event.target;


          const location =
            marker.getLatLng();


          const safePosition =
            clampToChitral(
              location.lat,
              location.lng
            );


          marker.setLatLng(
            safePosition
          );


          setPosition(
            safePosition
          );
        },
      }}
    />
  );
}
