"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const RestaurantMap = dynamic(() => import("@/components/RestaurantMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Caricamento mappa...</p>
    </div>
  ),
});

interface Restaurant {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  description: string;
  priceRange: string;
  rating: number;
  image: string;
  address: string;
  phone?: string;
  hours?: string;
  lat?: number;
  lng?: number;
}

export default function MapPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("/restaurants.json");
        const data = await response.json();

        // Carica le modifiche da localStorage
        const savedEdits = localStorage.getItem("editedRestaurants");
        const editsMap = savedEdits ? JSON.parse(savedEdits) : {};

        let allRestaurants = [...data.restaurants];

        // Aggiungi ristoranti nuovi
        const newRestaurants = localStorage.getItem("newRestaurants");
        if (newRestaurants) {
          const parsed = JSON.parse(newRestaurants);
          const onlyNewOnes = parsed.filter((r: Restaurant) => !data.restaurants.some((orig: Restaurant) => orig.id === r.id));
          allRestaurants = [...allRestaurants, ...onlyNewOnes];
        }

        // Applica le modifiche
        allRestaurants = allRestaurants.map((r) => editsMap[r.id] || r);

        // Filtra eliminati
        const savedDeleted = localStorage.getItem("deletedRestaurants");
        const deleted = savedDeleted ? JSON.parse(savedDeleted) : [];
        allRestaurants = allRestaurants.filter((r) => !deleted.includes(r.id));

        setRestaurants(allRestaurants);
      } catch (error) {
        console.error("Errore nel caricamento dei ristoranti:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <p className="text-xl text-granata-500">Caricamento mappa...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Header Navigation */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-granata-500 hover:text-granata-600 font-medium"
          >
            <ArrowLeft size={20} />
            <span>Torna ai ristoranti</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mappa Ristoranti</h1>
        </div>
      </div>

      {/* Mappa */}
      <div className="pt-16 h-full">
        <RestaurantMap restaurants={restaurants} mapStyle="voyager" />
      </div>
    </div>
  );
}
