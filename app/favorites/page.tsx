"use client";

import { useState, useEffect } from "react";
import { Heart, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

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
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    // Carica i favoriti
    const saved = localStorage.getItem("favorites");
    if (saved) {
      const ids = JSON.parse(saved);
      setFavoriteIds(ids);

      // Carica i dati dei ristoranti
      fetch("/restaurants.json")
        .then((res) => res.json())
        .then((data) => {
          const favRests = data.restaurants.filter((r: any) =>
            ids.includes(r.id)
          );
          setFavorites(favRests);
        });
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updated = favoriteIds.filter((f) => f !== id);
    setFavoriteIds(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites(favorites.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-granata-500 hover:text-granata-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Ristoranti Salvati</h1>
          <p className="text-gray-600 mt-2">
            {favorites.length} {favorites.length === 1 ? "ristorante" : "ristoranti"}{" "}
            nella tua lista
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((restaurant) => (
              <div
                key={restaurant.id}
                className="group rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-granata-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Immagine */}
                <Link href={`/restaurant/${restaurant.id}`}>
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(restaurant.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Heart className="w-5 h-5 fill-granata-500 text-granata-500" />
                    </button>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5">
                  <Link href={`/restaurant/${restaurant.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 hover:text-granata-500 transition-colors mb-1">
                      {restaurant.name}
                    </h3>
                  </Link>

                  {/* Location & Cuisine */}
                  <p className="text-xs text-gray-500 mb-2">{restaurant.address}</p>

                  {/* Cuisine & Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-granata-500">
                      {restaurant.cuisine}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      €{restaurant.priceRange}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {restaurant.rating}
                      </span>
                    </div>
                    <Link
                      href={`/restaurant/${restaurant.id}`}
                      className="text-sm font-medium text-granata-500 hover:text-granata-600 transition-colors"
                    >
                      Vedi →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Nessun favorito ancora</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-sm mx-auto">
              Inizia a esplorare e aggiungi i tuoi ristoranti preferiti alla lista
            </p>
            <Link
              href="/"
              className="px-8 py-3 bg-granata-500 text-white rounded-lg hover:bg-granata-600 transition-colors font-medium inline-block"
            >
              Scopri Ristoranti
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
