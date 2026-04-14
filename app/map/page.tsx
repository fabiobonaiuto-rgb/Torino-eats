"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, Menu, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function MapPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        setCategories(data.categories);
      } catch (error) {
        console.error("Errore nel caricamento dei ristoranti:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  let filteredRestaurants = restaurants.filter((r) => {
    const matchCategory = selectedCategory ? r.category === selectedCategory : true;
    return matchCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <p className="text-xl text-granata-500">Caricamento mappa...</p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:flex md:h-screen md:w-screen md:gap-5 md:overflow-hidden" style={{ background: "linear-gradient(to bottom, #B80036 0%, #520018 69%)", padding: "20px" }}>
        {/* Sidebar with Logo */}
        <div className="flex flex-col">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-5"
            style={{ fontSize: "20px", fontWeight: 600 }}
          >
            <ArrowLeft size={20} />
            Torino Eats.
          </Link>
          {/* Sidebar */}
          <motion.div
            className="w-[280px] flex flex-col z-40 border border-white rounded-3xl"
            style={{ height: "calc(100vh - 60px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="p-6 flex flex-col h-full overflow-hidden">
              {/* Categories Heading */}
              <h3 className="text-white mb-4" style={{ fontSize: "14px", fontWeight: 500 }}>
                Categorie
              </h3>

              {/* Categories - Scrollable */}
              <div className="flex-1 overflow-y-auto mb-8 flex flex-col gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-left transition-colors py-2 px-2 rounded hover:bg-white/10"
                  style={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: selectedCategory === null ? "#FFFFFF" : "#D4A0A0",
                  }}
                >
                  Tutti
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="text-left transition-colors py-2 px-2 rounded hover:bg-white/10"
                    style={{
                      fontSize: "14px",
                      fontWeight: 400,
                      color: selectedCategory === cat.name ? "#FFFFFF" : "#D4A0A0",
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", margin: "32px 0 16px 0" }}></div>

              {/* Counter Section */}
              <div>
                <div className="text-white" style={{ fontSize: "28px", fontWeight: 600 }}>
                  {filteredRestaurants.length}
                </div>
                <p className="mt-1" style={{ fontSize: "12px", fontWeight: 400, color: "#D4A0A0" }}>
                  Ristoranti
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Area */}
        <motion.div
          className="flex-1 rounded-3xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <RestaurantMap
            restaurants={filteredRestaurants}
            mapStyle="voyager"
            focusedRestaurant={null}
          />
        </motion.div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden h-screen w-screen flex flex-col overflow-hidden" style={{ background: "linear-gradient(to bottom, #B80036 0%, #520018 69%)" }}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/15 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
            style={{ fontSize: "20px", fontWeight: 600 }}
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Torino Eats.</span>
          </Link>

          {/* Menu Button */}
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
            whileHover={{ scale: 1.1 }}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-white" strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Dropdown Menu */}
        <motion.div
          initial={{ opacity: 0, maxHeight: 0 }}
          animate={sidebarOpen ? { opacity: 1, maxHeight: "400px" } : { opacity: 0, maxHeight: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden border-b border-white/15 px-5 pb-5 flex-shrink-0"
        >
          {/* Categories */}
          <div>
            <h3 className="text-white/90 text-sm font-medium mb-3">Categorie</h3>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSidebarOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg transition-colors text-white/90 hover:bg-white/10"
                style={{
                  backgroundColor: selectedCategory === null ? "rgba(255,255,255,0.15)" : "transparent",
                }}
              >
                Tutti
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSidebarOpen(false);
                  }}
                  className="text-left px-3 py-2 rounded-lg transition-colors text-white/90 hover:bg-white/10"
                  style={{
                    backgroundColor: selectedCategory === cat.name ? "rgba(255,255,255,0.15)" : "transparent",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Map Area */}
        <motion.div
          className="flex-1 rounded-3xl overflow-hidden m-5 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <RestaurantMap
            restaurants={filteredRestaurants}
            mapStyle="voyager"
            focusedRestaurant={null}
          />
        </motion.div>
      </div>
    </>
  );
}
