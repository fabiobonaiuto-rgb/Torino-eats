"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  category?: string;
  image?: string;
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
  mapStyle?: "osm" | "dark" | "satellite" | "positron" | "toner" | "voyager";
}

// Marker icon granata personalizzato
const createGranataIcon = () => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 2C9.4 2 4 7.4 4 14c0 7 12 26 12 26s12-19 12-26c0-6.6-5.4-12-12-12z" fill="#a81c39"/>
      <circle cx="16" cy="14" r="4" fill="white"/>
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

const granataIcon = createGranataIcon();

const mapStyles = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    label: "OpenStreetMap",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    label: "Dark Mode",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
    label: "Satellite",
  },
  positron: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    label: "Positron",
  },
  toner: {
    url: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    label: "Stamen Toner",
  },
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    label: "CartoDB Voyager",
  },
};

export default function RestaurantMap({ restaurants, mapStyle = "osm" }: RestaurantMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtra ristoranti che hanno coordinate
  const restaurantsWithCoords = restaurants.filter((r) => r.lat && r.lng);

  // Centro della mappa (Torino)
  const center: [number, number] = [45.0705, 7.6868];

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Caricamento mappa...</p>
      </div>
    );
  }

  if (restaurantsWithCoords.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <p className="text-gray-600 text-lg">
          Nessun ristorante con coordinate disponibile ancora
        </p>
        <p className="text-gray-500 text-sm">Aggiungi le coordinate ai ristoranti</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url={mapStyles[mapStyle].url}
          attribution={mapStyles[mapStyle].attribution}
        />

        {restaurantsWithCoords.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat!, restaurant.lng!]}
            icon={granataIcon}
          >
            <Popup>
              <div className="w-48">
                {restaurant.image && (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-32 object-cover rounded-t-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{restaurant.category}</p>
                <p className="text-sm text-gray-500 mb-3">{restaurant.address}</p>
                <Link
                  href={`/restaurant/${restaurant.id}`}
                  className="block w-full text-center bg-granata-500 text-white py-2 rounded-lg hover:bg-granata-600 transition-colors text-sm font-medium"
                >
                  Visualizza
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 max-w-xs z-40">
        <h3 className="font-semibold text-gray-900 mb-2">Legenda</h3>
        <p className="text-sm text-gray-600">
          {restaurantsWithCoords.length} ristorante{restaurantsWithCoords.length !== 1 ? "i" : ""} sulla mappa
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Clicca su un marker per vedere i dettagli
        </p>
      </div>
    </div>
  );
}
