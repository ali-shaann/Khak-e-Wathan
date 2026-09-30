"use client";

import L from "leaflet";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import { Property } from "@/types/property";

export default function SinglePropertyMap({
  property,
}: {
  property: Property;
}) {
  if (
    property.latitude === null ||
    property.longitude === null
  ) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="font-semibold text-slate-700">
            Location unavailable
          </p>

          <p className="mt-1 text-sm text-slate-400">
            This property does not have map coordinates yet.
          </p>
        </div>
      </div>
    );
  }

  const position: [number, number] = [
    property.latitude,
    property.longitude,
  ];

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom
      className="h-full min-h-[320px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={position}
        icon={createPropertyIcon()}
      >
        <Popup>
          <div className="py-1">
            <p className="font-bold text-slate-950">
              {property.title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {property.location}, Chitral
            </p>

            <p className="mt-2 font-semibold">
              {property.price}
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
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

    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -25],
  });
}