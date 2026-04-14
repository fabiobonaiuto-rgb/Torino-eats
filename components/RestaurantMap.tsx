"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
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
  focusedRestaurant?: Restaurant | null;
}

// Marker icon personalizzato con colore preciso
const createRestaurantIcon = () => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48">
      <path d="M16 2C8.27 2 2 8.27 2 16c0 8 14 30 14 30s14-22 14-30c0-7.73-6.27-14-14-14z" fill="#A01C3C"/>
      <circle cx="16" cy="16" r="5" fill="white"/>
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};

const restaurantIcon = createRestaurantIcon();

// Componente hook per gestire il focus sulla mappa
function MapFocusController({ focusedRestaurant }: { focusedRestaurant?: Restaurant | null }) {
  const map = useMap();

  useEffect(() => {
    if (
      focusedRestaurant &&
      typeof focusedRestaurant.lat === 'number' &&
      typeof focusedRestaurant.lng === 'number' &&
      !isNaN(focusedRestaurant.lat) &&
      !isNaN(focusedRestaurant.lng) &&
      focusedRestaurant.lat > 0 &&
      focusedRestaurant.lng > 0
    ) {
      map.flyTo([focusedRestaurant.lat, focusedRestaurant.lng], 17, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [focusedRestaurant, map]);

  return null;
}

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

export default function RestaurantMap({ restaurants, mapStyle = "osm", focusedRestaurant }: RestaurantMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtra ristoranti che hanno coordinate valide (numeri, non NaN)
  const restaurantsWithCoords = restaurants.filter(
    (r) =>
      typeof r.lat === 'number' &&
      typeof r.lng === 'number' &&
      !isNaN(r.lat) &&
      !isNaN(r.lng)
  );

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
    <div className="w-full h-full relative" style={{ minHeight: "600px" }}>
      <MapContainer
        center={center}
        zoom={15}
        className="w-full h-full"
      >
        <TileLayer
          url={mapStyles[mapStyle].url}
          attribution={mapStyles[mapStyle].attribution}
        />

        <MapFocusController focusedRestaurant={focusedRestaurant} />

        {restaurantsWithCoords.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat!, restaurant.lng!]}
            icon={restaurantIcon}
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
      <motion.div
        className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 max-w-xs z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.45, ease: [0.23, 1, 0.32, 1] }}
      >
        <h3 className="font-semibold text-gray-900 mb-2">Legenda</h3>
        <p className="text-sm text-gray-600">
          {restaurantsWithCoords.length} ristorante{restaurantsWithCoords.length !== 1 ? "i" : ""} sulla mappa
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Clicca su un marker per vedere i dettagli
        </p>
      </motion.div>
    </div>
  );
}
