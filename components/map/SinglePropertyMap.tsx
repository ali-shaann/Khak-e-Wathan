"use client";

import {
  createPortal,
} from "react-dom";

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
  CHITRAL_MAX_BOUNDS,
  CHITRAL_MAX_ZOOM,
  CHITRAL_MIN_ZOOM,
} from "@/components/map/mapConfig";


export default function SinglePropertyMap({
  property,
}: {
  property: Property;
}) {
  if (
    property.latitude ===
      null ||
    property.longitude ===
      null
  ) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-slate-100">

        <div className="text-center">

          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            ◇
          </div>


          <p className="mt-4 font-semibold text-slate-700">
            Location unavailable
          </p>


          <p className="mt-1 text-sm text-slate-400">
            This property does not have map coordinates yet.
          </p>
        </div>
      </div>
    );
  }


  const position:
    [number, number] = [
      property.latitude,
      property.longitude,
    ];


  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-slate-100">

      <MapContainer
        center={
          position
        }
        zoom={15}
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
        className="h-full min-h-[320px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <PropertyMapOverlay
          position={
            position
          }
        />


        <Marker
          position={
            position
          }
          icon={
            createPropertyIcon()
          }
        >
          <Popup>
            <div className="py-1">

              <p className="font-bold text-slate-950">
                {
                  property.title
                }
              </p>


              <p className="mt-1 text-sm text-slate-500">
                {
                  property.location
                }, Chitral
              </p>


              <p className="mt-2 font-semibold">
                {
                  property.price
                }
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}


function PropertyMapOverlay({
  position,
}: {
  position:
    [number, number];
}) {
  const map =
    useMap();

  const mapContainer =
    map.getContainer();


  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-[1000]">

      <div className="absolute bottom-3 left-3 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-lg backdrop-blur-md">
        Approximate location
      </div>


      <button
        type="button"
        onPointerDown={(
          event
        ) =>
          event.stopPropagation()
        }
        onClick={() =>
          map.setView(
            position,
            15,
            {
              animate: true,
            }
          )
        }
        className="pointer-events-auto absolute right-3 top-3 rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:text-slate-950"
      >
        Recenter
      </button>
    </div>,
    mapContainer
  );
}


function createPropertyIcon() {
  return L.divIcon({
    className: "",

    html: `
      <div
        style="
          width:42px;
          height:42px;
          border-radius:50%;
          background:#020617;
          border:4px solid white;
          box-shadow:0 10px 25px rgba(15,23,42,0.3);
          display:flex;
          align-items:center;
          justify-content:center;
        "
      >
        <div
          style="
            width:10px;
            height:10px;
            border-radius:50%;
            background:#34d399;
          "
        ></div>
      </div>
    `,

    iconSize: [
      42,
      42,
    ],

    iconAnchor: [
      21,
      21,
    ],

    popupAnchor: [
      0,
      -25,
    ],
  });
}
