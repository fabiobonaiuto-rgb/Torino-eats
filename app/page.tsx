"use client";

import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Search, ArrowRight, Plus, Pencil, Trash2, Map } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import AddRestaurantModal from "@/components/AddRestaurantModal";
import EditRestaurantModal from "@/components/EditRestaurantModal";
import StarRating from "@/components/StarRating";
import { HeroSection } from "@/components/HeroSection";

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

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hoveredRestaurantId, setHoveredRestaurantId] = useState<string | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editRestaurantsMap, setEditRestaurantsMap] = useState<Record<string, Restaurant>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [originalRestaurantIds, setOriginalRestaurantIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"name" | "recent" | "rating">("name");

  useEffect(() => {
    setIsClient(true);

    // Carica le modifiche da localStorage
    const savedEdits = localStorage.getItem("editedRestaurants");
    const editsMap = savedEdits ? JSON.parse(savedEdits) : {};
    setEditRestaurantsMap(editsMap);

    // Carica i ristoranti eliminati
    const savedDeleted = localStorage.getItem("deletedRestaurants");
    const deleted = savedDeleted ? JSON.parse(savedDeleted) : [];
    setDeletedIds(deleted);

    // Carica i dati
    fetch("/restaurants.json")
      .then((res) => res.json())
      .then((data) => {
        // Salva gli IDs originali per identificare i ristoranti nuovi
        setOriginalRestaurantIds(new Set(data.restaurants.map((r: Restaurant) => r.id)));

        let allRestaurants = [...data.restaurants];

        // Aggiungi i ristoranti salvati in localStorage (SOLO i nuovi, non i duplicati)
        const newRestaurants = localStorage.getItem("newRestaurants");
        if (newRestaurants) {
          const parsed = JSON.parse(newRestaurants);
          // Filtra: mantieni solo i ristoranti che NON sono negli originali
          const onlyNewOnes = parsed.filter((r: Restaurant) => !data.restaurants.some((orig: Restaurant) => orig.id === r.id));
          allRestaurants = [...allRestaurants, ...onlyNewOnes];
        }

        // Applica le modifiche (override per id)
        allRestaurants = allRestaurants.map((r) => editsMap[r.id] || r);

        // Filtra i ristoranti eliminati
        allRestaurants = allRestaurants.filter((r) => !deleted.includes(r.id));

        setRestaurants(allRestaurants);
        setCategories(data.categories);
      });

    // Carica i favoriti da localStorage
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));

    // Carica i rating da localStorage
    const savedRatings = localStorage.getItem("ratings");
    if (savedRatings) setRatings(JSON.parse(savedRatings));
  }, []);

  // Filtra ristoranti per categoria, ricerca e eliminati
  let filteredRestaurants = restaurants.filter((r) => {
    const matchCategory = selectedCategory
      ? r.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;
    const matchSearch = r.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const notDeleted = !deletedIds.includes(r.id);
    return matchCategory && matchSearch && notDeleted;
  });

  // Ordina in base al sortBy
  if (sortBy === "name") {
    filteredRestaurants = [...filteredRestaurants].sort((a, b) =>
      a.name.localeCompare(b.name, "it")
    );
  } else if (sortBy === "recent") {
    // I ristoranti aggiunti di recente sono alla fine dell'array
    filteredRestaurants = [...filteredRestaurants].reverse();
  } else if (sortBy === "rating") {
    // Ordina dalla più valutata alla meno valutata
    filteredRestaurants = [...filteredRestaurants].sort((a, b) => {
      const ratingA = ratings[a.id] || 0;
      const ratingB = ratings[b.id] || 0;
      return ratingB - ratingA;
    });
  }

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleAddRestaurant = (newRestaurant: {
    name: string;
    address: string;
    image: string;
    category: string;
  }) => {
    const restaurant: Restaurant = {
      id: newRestaurant.name.toLowerCase().replace(/\s+/g, "-"),
      name: newRestaurant.name,
      category: newRestaurant.category,
      cuisine: "Nuova cucina",
      description: "Locale appena aggiunto",
      priceRange: "10-20",
      rating: 7,
      image: newRestaurant.image,
      address: newRestaurant.address,
      phone: "",
      hours: "Lun-Dom: 11:00-23:00",
    };

    // Aggiorna lo stato locale
    setRestaurants(prev => [...prev, restaurant]);

    // Carica i ristoranti nuovi esistenti da localStorage
    const existing = localStorage.getItem("newRestaurants");
    const newList = existing ? JSON.parse(existing) : [];

    // Aggiungi SOLO il nuovo ristorante (non tutta la lista)
    newList.push(restaurant);

    // Salva la lista aggiornata
    localStorage.setItem("newRestaurants", JSON.stringify(newList));

    setIsModalOpen(false);
  };

  const handleRating = (restaurantId: string, rating: number) => {
    const updated = { ...ratings, [restaurantId]: rating };
    setRatings(updated);
    localStorage.setItem("ratings", JSON.stringify(updated));
  };

  const handleEditRestaurant = (updatedRestaurant: Restaurant) => {
    // Aggiorna lo stato restaurants
    const updatedList = restaurants.map((r) =>
      r.id === updatedRestaurant.id ? updatedRestaurant : r
    );
    setRestaurants(updatedList);

    // Salva le modifiche in localStorage
    const updatedEdits = { ...editRestaurantsMap, [updatedRestaurant.id]: updatedRestaurant };
    setEditRestaurantsMap(updatedEdits);
    localStorage.setItem("editedRestaurants", JSON.stringify(updatedEdits));

    setEditingRestaurant(null);
  };

  const handleDeleteRestaurant = (id: string) => {
    // Rimuovi dalla lista visibile
    const updated = restaurants.filter((r) => r.id !== id);
    setRestaurants(updated);

    // Salva gli ID eliminati
    const updatedDeleted = [...deletedIds, id];
    setDeletedIds(updatedDeleted);
    localStorage.setItem("deletedRestaurants", JSON.stringify(updatedDeleted));
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #B80036 0%, #520018 69%)" }}>
      {/* Hero Section with integrated controls */}
      <HeroSection
        restaurantCount={restaurants.length}
        onAddRestaurant={() => setIsModalOpen(true)}
      />

      {/* Search Bar */}
      <motion.div
        className="border-b border-white/15 px-4 sm:px-6 lg:px-8 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="search-restaurants" className="sr-only">
                Cerca ristorante
              </label>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none z-10" style={{ color: "rgba(255,255,255,0.9)" }} />
              <input
                id="search-restaurants"
                type="text"
                placeholder="Cerca ristorante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all text-white placeholder-white/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-white/80 font-medium self-center">Ordina per:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "recent" | "rating")}
                className="px-3 py-2 border border-white/20 rounded-lg text-sm font-medium text-white bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer focus:ring-2 focus:ring-white/50 focus:border-white/40"
              >
                <option value="name">Alfabetico (A-Z)</option>
                <option value="recent">Ultima aggiunta</option>
                <option value="rating">Stelle (più valutati)</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Categories Filter */}
      <nav className="sticky top-0 z-50 border-b border-white/15 w-full px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-sm bg-black/10">
        <motion.div
          className="max-w-7xl mx-auto flex gap-1 overflow-x-auto pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <button
            onClick={() => setSelectedCategory(null)}
            style={selectedCategory === null ? { backgroundColor: "rgba(255, 255, 255, 0.2)", color: "white", borderColor: "rgba(255, 255, 255, 0.4)" } : { backgroundColor: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.7)", borderColor: "rgba(255, 255, 255, 0.2)" }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:bg-white/15 border"
          >
            Tutti
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              style={selectedCategory === cat.name ? { backgroundColor: "rgba(255, 255, 255, 0.2)", color: "white", borderColor: "rgba(255, 255, 255, 0.4)" } : { backgroundColor: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.7)", borderColor: "rgba(255, 255, 255, 0.2)" }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:bg-white/15 border"
            >
              {cat.name}
            </button>
          ))}
        </motion.div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Category Header */}
        {selectedCategory && (
          <motion.div
            className="mb-12 pb-8 border-b border-white/15"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
              {selectedCategory}
            </h2>
            <p className="text-white/80 text-lg">
              {categories.find((c) => c.name === selectedCategory)?.description}
            </p>
          </motion.div>
        )}

        {/* Grid di Ristoranti */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isClient && restaurants.length > 0 ? (
            filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link
                href={`/restaurant/${restaurant.id}`}
                onMouseEnter={() => setHoveredRestaurantId(restaurant.id)}
                onMouseLeave={() => setHoveredRestaurantId(null)}
                className="group rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:bg-white/15 h-full"
              >
              {/* Immagine */}
              <div className="flex-shrink-0 relative">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-video">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteRestaurant(restaurant.id);
                  }}
                  style={{
                    backgroundColor: "white",
                    opacity: hoveredRestaurantId === restaurant.id ? 1 : 0,
                    pointerEvents: hoveredRestaurantId === restaurant.id ? "auto" : "none",
                  }}
                  className="absolute top-3 right-28 p-2.5 rounded-full transition-all duration-200 hover:shadow-md z-10"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingRestaurant(restaurant);
                  }}
                  style={{
                    backgroundColor: "white",
                    opacity: hoveredRestaurantId === restaurant.id ? 1 : 0,
                    pointerEvents: hoveredRestaurantId === restaurant.id ? "auto" : "none",
                  }}
                  className="absolute top-3 right-16 p-2.5 rounded-full transition-all duration-200 hover:shadow-md z-10"
                >
                  <Pencil className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(restaurant.id);
                  }}
                  style={{
                    backgroundColor: favorites.includes(restaurant.id)
                      ? "#a81c39"
                      : "white",
                    opacity: hoveredRestaurantId === restaurant.id ? 1 : 0,
                    pointerEvents: hoveredRestaurantId === restaurant.id ? "auto" : "none",
                  }}
                  className="absolute top-3 right-4 p-2.5 rounded-full transition-all duration-200 hover:shadow-md z-10"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      favorites.includes(restaurant.id)
                        ? "fill-white text-white"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {restaurant.name}
                  </h3>

                  {/* Location & Price */}
                  <div className="flex items-center justify-between text-xs mb-2 flex-grow-0">
                    <span className="text-white/70 truncate">{restaurant.address}</span>
                    <span className="font-medium text-white/80 ml-2 flex-shrink-0">€{restaurant.priceRange}</span>
                  </div>

                  {/* Cuisine */}
                  <div className="mb-3">
                    <span className="font-medium text-sm text-white">
                      {restaurant.cuisine}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-white/80 mb-4 line-clamp-2 flex-grow">
                    {restaurant.description}
                  </p>

                  {/* Footer */}
                  <div className="flex flex-col gap-4 pt-4 border-t border-white/10 flex-grow-0">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-xs text-white/70 font-medium">Il tuo voto</p>
                        <StarRating
                          onRate={(rating) => handleRating(restaurant.id, rating)}
                          initialRating={ratings[restaurant.id] || 0}
                          interactive
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            ))
          ) : (
            [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="rounded-2xl bg-white/10 h-64 animate-pulse backdrop-blur-sm border border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            ))
          )}
        </div>

        {/* Empty State */}
        {isClient && filteredRestaurants.length === 0 && (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {restaurants.length === 0 ? (
              <>
                <p className="text-white text-2xl font-semibold mb-2">
                  Nessun ristorante ancora
                </p>
                <p className="text-white/80 text-lg mb-6">
                  Aggiungi il tuo primo ristorante preferito di Torino
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-block px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 bg-white/20 hover:bg-white/30 border border-white/40"
                >
                  + Aggiungi ristorante
                </button>
              </>
            ) : (
              <>
                <p className="text-white text-2xl font-semibold mb-2">
                  Nessun risultato trovato
                </p>
                <p className="text-white/80 text-lg">
                  Prova a modificare la ricerca o la categoria selezionata
                </p>
              </>
            )}
          </motion.div>
        )}
      </main>

      {/* Add Restaurant Modal */}
      <AddRestaurantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddRestaurant}
        categories={categories.map((c) => c.name)}
      />

      {/* Edit Restaurant Modal */}
      <EditRestaurantModal
        isOpen={editingRestaurant !== null}
        restaurant={editingRestaurant}
        onClose={() => setEditingRestaurant(null)}
        onSave={handleEditRestaurant}
        categories={categories.map((c) => c.name)}
      />
    </div>
  );
}
