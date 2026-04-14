"use client";

import { useState, useEffect } from "react";
import { Heart, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <div className="min-h-screen w-screen p-5" style={{ background: "linear-gradient(to bottom, #B80036 0%, #520018 69%)" }}>
      <motion.div
        className="w-full h-full rounded-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Header */}
        <header className="border-b border-white/15 p-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </Link>
          <h1 className="text-4xl font-bold text-white">Ristoranti Salvati</h1>
          <p className="text-white/70 mt-2">
            {favorites.length} {favorites.length === 1 ? "ristorante" : "ristoranti"}{" "}
            nella tua lista
          </p>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((restaurant, idx) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                className="group rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:shadow-lg transition-all duration-300"
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
                    <h3 className="text-xl font-bold text-white hover:text-white/90 transition-colors mb-1">
                      {restaurant.name}
                    </h3>
                  </Link>

                  {/* Location & Cuisine */}
                  <p className="text-xs text-white/70 mb-2 truncate">{restaurant.address}</p>

                  {/* Cuisine & Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">
                      {restaurant.cuisine}
                    </span>
                    <span className="text-sm font-medium text-white/80">
                      €{restaurant.priceRange}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-white/80 mb-4 line-clamp-2">
                    {restaurant.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-white">
                        {restaurant.rating}
                      </span>
                    </div>
                    <Link
                      href={`/restaurant/${restaurant.id}`}
                      className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                    >
                      Vedi →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-white/40" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Nessun favorito ancora</h2>
            <p className="text-white/80 text-lg mb-8 max-w-sm mx-auto">
              Inizia a esplorare e aggiungi i tuoi ristoranti preferiti alla lista
            </p>
            <Link
              href="/"
              className="px-8 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium inline-block border border-white/40"
            >
              Scopri Ristoranti
            </Link>
          </motion.div>
        )}
        </main>
      </motion.div>
    </div>
  );
}
