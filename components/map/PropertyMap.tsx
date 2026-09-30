"use client";

import { useEffect } from "react";
import Link from "next/link";

import L from "leaflet";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import { Property } from "@/types/property";

type MappedProperty = Property & {
  latitude: number;
  longitude: number;
};

export default function PropertyMap({
  properties,
}: {
  properties: Property[];
}) {
  const mappedProperties =
    properties.filter(
      (
        property
      ): property is MappedProperty =>
        property.latitude !== null &&
        property.longitude !== null
    );

  return (
    <MapContainer
      center={[36.273329, 72.259292]}
      zoom={11}
      scrollWheelZoom
      className="h-full min-h-[500px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitMapToProperties
        properties={mappedProperties}
      />

      {mappedProperties.map((property) => (
        <Marker
          key={property.id}
          position={[
            property.latitude,
            property.longitude,
          ]}
          icon={createPriceIcon(
            property.pricePkr
          )}
        >
          <Popup minWidth={240}>
            <div className="py-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {property.type}
              </p>

              <h3 className="mt-1 text-base font-bold text-slate-950">
                {property.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {property.location}, Chitral
              </p>

              <p className="mt-3 text-lg font-bold text-slate-950">
                {property.price}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <MapBadge
                  text={property.size}
                />

                {property.roadAccess && (
                  <MapBadge text="Road" />
                )}

                {property.waterAvailable && (
                  <MapBadge text="Water" />
                )}

                {property.electricityAvailable && (
                  <MapBadge text="Power" />
                )}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <Link
                  href={`/properties/${property.id}`}
                  className="font-semibold text-slate-950"
                >
                  View Property Passport →
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function FitMapToProperties({
  properties,
}: {
  properties: MappedProperty[];
}) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) {
      return;
    }

    if (properties.length === 1) {
      map.setView(
        [
          properties[0].latitude,
          properties[0].longitude,
        ],
        15
      );

      return;
    }

    const bounds = L.latLngBounds(
      properties.map((property) => [
        property.latitude,
        property.longitude,
      ])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [map, properties]);

  return null;
}

function createPriceIcon(
  pricePkr: number
) {
  const label =
    formatMarkerPrice(pricePkr);

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
          background:#020617;
          color:white;
          font-size:12px;
          font-weight:700;
          white-space:nowrap;
          box-shadow:0 8px 24px rgba(15,23,42,0.25);
          border:2px solid rgba(255,255,255,0.9);
        "
      >
        ${label}
      </div>
    `,

    iconSize: [64, 34],
    iconAnchor: [32, 17],
    popupAnchor: [0, -22],
  });
}

function formatMarkerPrice(
  pricePkr: number
) {
  if (pricePkr >= 10_000_000) {
    const crore =
      pricePkr / 10_000_000;

    return `${formatNumber(crore)}Cr`;
  }

  const lakh =
    pricePkr / 100_000;

  return `${formatNumber(lakh)}L`;
}

function formatNumber(
  value: number
) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
}

function MapBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
      {text}
    </span>
  );
}