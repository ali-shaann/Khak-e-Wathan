"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import {
  divIcon,
  type LatLngExpression,
} from "leaflet";

import {
  useState,
} from "react";

const markerIcon = divIcon({
  className: "",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      background: #0f172a;
      border: 4px solid white;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(15,23,42,.35);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const DEFAULT_CENTER: LatLngExpression = [
  35.9,
  71.8,
];

export default function LocationPicker() {
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  return (
    <div>
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={10}
          scrollWheelZoom
          className="h-[420px] w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            position={position}
            setPosition={setPosition}
          />
        </MapContainer>
      </div>

      <input
        type="hidden"
        name="latitude"
        value={position?.lat ?? ""}
      />

      <input
        type="hidden"
        name="longitude"
        value={position?.lng ?? ""}
      />

      {position ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Location selected:{" "}
          {position.lat.toFixed(6)},{" "}
          {position.lng.toFixed(6)}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Click the map to mark the approximate property
          location.
        </div>
      )}
    </div>
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

  setPosition: React.Dispatch<
    React.SetStateAction<{
      lat: number;
      lng: number;
    } | null>
  >;
}) {
  useMapEvents({
    click(event) {
      setPosition({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
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
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend(event) {
          const marker =
            event.target;

          const location =
            marker.getLatLng();

          setPosition({
            lat: location.lat,
            lng: location.lng,
          });
        },
      }}
    />
  );
}