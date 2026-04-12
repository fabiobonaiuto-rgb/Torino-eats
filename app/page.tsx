"use client";

import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Search, ArrowRight, Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
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
    <div className="min-h-screen bg-white">
      {/* Hero Section with integrated controls */}
      <div className="relative">
        <HeroSection restaurantCount={restaurants.length} />
        {isClient && (
          <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ backgroundColor: "#a81c39" }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Aggiungi</span>
            </button>
            <Link
              href="/favorites"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-5 h-5 fill-current" style={{ color: "#a81c39" }} />
              <span className="text-sm font-medium text-gray-700">
                {favorites.length}
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca ristorante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-700"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium self-center">Ordina per:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "recent" | "rating")}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="name">Alfabetico (A-Z)</option>
                <option value="recent">Ultima aggiunta</option>
                <option value="rating">Stelle (più valutati)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <nav className="sticky top-16 z-50 bg-white border-b border-gray-100 w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            style={selectedCategory === null ? { backgroundColor: "#a81c39", color: "white" } : { backgroundColor: "#e5e7eb", color: "#374151" }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:opacity-80"
          >
            Tutti
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              style={selectedCategory === cat.name ? { backgroundColor: "#a81c39", color: "white" } : { backgroundColor: "#e5e7eb", color: "#374151" }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:opacity-80"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Category Header */}
        {selectedCategory && (
          <div className="mb-12 pb-8 border-b border-gray-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              {selectedCategory}
            </h2>
            <p className="text-gray-600 text-lg">
              {categories.find((c) => c.name === selectedCategory)?.description}
            </p>
          </div>
        )}

        {/* Grid di Ristoranti */}
        {isClient ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              onMouseEnter={() => setHoveredRestaurantId(restaurant.id)}
              onMouseLeave={() => setHoveredRestaurantId(null)}
              style={{
                animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s both`,
              }}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-200 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Immagine */}
              <div className="flex-shrink-0 relative">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-video">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {restaurant.name}
                </h3>

                {/* Location & Price */}
                <div className="flex items-center justify-between text-xs mb-2 flex-grow-0">
                  <span className="text-gray-500">{restaurant.address}</span>
                  <span className="font-medium text-gray-500">€{restaurant.priceRange}</span>
                </div>

                {/* Cuisine */}
                <div className="mb-3">
                  <span className="font-medium text-sm" style={{ color: "#a81c39" }}>
                    {restaurant.cuisine}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                  {restaurant.description}
                </p>

                {/* Footer */}
                <div className="flex flex-col gap-4 pt-4 border-t border-gray-100 flex-grow-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs text-gray-500 font-medium">Il tuo voto</p>
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
            </div>
          ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {isClient && filteredRestaurants.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-600 text-lg">
              Nessun ristorante trovato in questa categoria.
            </p>
          </div>
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
