"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Star, MapPin, Clock, Phone, MoreVertical, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";

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
  specialties?: string[];
  reviews?: Array<{ rating: number; comment: string }>;
  images?: string[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetail({ params: paramsPromise }: PageProps) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [allRatings, setAllRatings] = useState<number[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Risolvi il promise dei parametri
    paramsPromise.then((params) => {
      setRestaurantId(params.id);
    });
  }, [paramsPromise]);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchRestaurant = async () => {
      try {
        const response = await fetch("/restaurants.json");
        const data = await response.json();

        // Carica le modifiche da localStorage
        const savedEdits = localStorage.getItem("editedRestaurants");
        const editsMap = savedEdits ? JSON.parse(savedEdits) : {};

        let restaurant = data.restaurants.find((r: Restaurant) => r.id === restaurantId);

        if (!restaurant) {
          const newRestaurants = localStorage.getItem("newRestaurants");
          const newRests = newRestaurants ? JSON.parse(newRestaurants) : [];
          restaurant = newRests.find((r: Restaurant) => r.id === restaurantId);
        }

        if (restaurant && editsMap[restaurantId]) {
          restaurant = { ...restaurant, ...editsMap[restaurantId] };
        }

        setRestaurant(restaurant || null);

        // Carica il rating salvato
        const ratings = localStorage.getItem("ratings");
        const ratingsMap = ratings ? JSON.parse(ratings) : {};
        if (ratingsMap[restaurantId]) {
          setUserRating(ratingsMap[restaurantId]);
        }

        // Carica l'array di voti e calcola la media
        const ratingsKey = `ratings-array-${restaurantId}`;
        const savedRatings = localStorage.getItem(ratingsKey);
        if (savedRatings) {
          const ratingsArray = JSON.parse(savedRatings);
          const average = ratingsArray.reduce((a: number, b: number) => a + b, 0) / ratingsArray.length;
          setAllRatings(ratingsArray);
          setAverageRating(average);
        }

        // Carica i favoriti
        const favorites = localStorage.getItem("favorites");
        const favoritesList = favorites ? JSON.parse(favorites) : [];
        setIsFavorite(favoritesList.includes(restaurantId));

        // Carica le immagini della galleria
        const savedImages = localStorage.getItem(`images-${restaurantId}`);
        if (savedImages) {
          setGalleryImages(JSON.parse(savedImages));
        }
      } catch (error) {
        console.error("Errore nel caricamento del ristorante:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  const toggleFavorite = () => {
    const favorites = localStorage.getItem("favorites");
    let favoritesList = favorites ? JSON.parse(favorites) : [];

    if (isFavorite) {
      favoritesList = favoritesList.filter((id: string) => id !== restaurantId);
    } else {
      favoritesList.push(restaurantId);
    }

    localStorage.setItem("favorites", JSON.stringify(favoritesList));
    setIsFavorite(!isFavorite);
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);

    // Salva il voto in un array per calcolare la media
    const ratingsKey = `ratings-array-${restaurantId}`;
    const existingRatings = localStorage.getItem(ratingsKey);
    const ratingsArray = existingRatings ? JSON.parse(existingRatings) : [];

    // Aggiungi il nuovo voto
    ratingsArray.push(rating);
    localStorage.setItem(ratingsKey, JSON.stringify(ratingsArray));

    // Calcola la media
    const average = ratingsArray.reduce((a: number, b: number) => a + b, 0) / ratingsArray.length;
    setAllRatings(ratingsArray);
    setAverageRating(average);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newImages = [...galleryImages, base64];
        setGalleryImages(newImages);
        // Salva in localStorage
        localStorage.setItem(`images-${restaurantId}`, JSON.stringify(newImages));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    if (!confirm("Sei sicuro di voler eliminare questo ristorante?")) return;

    const deleted = JSON.parse(localStorage.getItem("deletedRestaurants") || "[]");
    deleted.push(restaurantId);
    localStorage.setItem("deletedRestaurants", JSON.stringify(deleted));

    router.push("/");
  };

  const handleEdit = () => {
    router.push(`/restaurant/${restaurantId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-screen" style={{ background: "linear-gradient(to bottom, #B80036 0%, #520018 69%)" }}>
        <p className="text-xl text-white">Caricamento...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 w-screen" style={{ background: "linear-gradient(to bottom, #B80036 0%, #520018 69%)" }}>
        <p className="text-xl text-white">Ristorante non trovato</p>
        <Link href="/" className="text-white/80 hover:text-white flex items-center gap-2">
          <ArrowLeft size={20} />
          Torna alla home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen p-5" style={{ background: "linear-gradient(to bottom, #B80036 0%, #520018 69%)" }}>
      <motion.div
        className="w-full rounded-3xl overflow-hidden"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-left {
          animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-right {
          animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      {/* Header con back button */}
      <div className="border-b border-white/15 p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Torna ai ristoranti
        </Link>
      </div>

      <div className="w-full px-6 py-8 flex-1 overflow-y-auto max-h-[calc(100vh-160px)]">
        {/* Main Content Grid - Image left, Info right */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Left Column - Hero Image (col-span-2) */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="relative aspect-square bg-white/10 rounded-xl overflow-hidden shadow-lg mb-4">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                {/* Favorite Button */}
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 bg-white/90 rounded-full p-3 shadow-lg hover:scale-110 transition-transform z-10"
                >
                  <Heart
                    size={24}
                    className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-800"}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Info (col-span-3) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header - Title & Category */}
            <div>
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {restaurant.name}
                    </h1>
                    <p className="text-sm text-white/70">
                      {restaurant.cuisine}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="bg-granata-100 dark:bg-granata-900 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      {restaurant.category}
                    </span>
                    {/* More Menu - Desktop only */}
                    <div className="hidden lg:block relative">
                      <motion.button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        whileHover={{ scale: 1.1 }}
                      >
                        <MoreVertical size={20} />
                      </motion.button>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden min-w-[160px] z-50 ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                      >
                        <motion.button
                          onClick={() => {
                            toggleFavorite();
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left flex items-center gap-3 border-b border-white/10"
                        >
                          <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-white"} />
                          {isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            handleEdit();
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left flex items-center gap-3 border-b border-white/10"
                        >
                          <Edit size={18} className="text-white" />
                          Modifica
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            handleDelete();
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-left flex items-center gap-3"
                        >
                          <Trash2 size={18} className="text-red-400" />
                          Elimina
                        </motion.button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating & Price */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-semibold text-white">
                    {averageRating > 0 ? averageRating.toFixed(1) : restaurant.rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-white/70">
                  Fascia prezzo: <span className="font-semibold text-white">€{restaurant.priceRange}</span>
                </div>
              </div>

              {/* Your Rating */}
              <div>
                <p className="text-sm font-semibold text-white/90 mb-2">
                  Il tuo voto: <span className="text-white">{userRating > 0 ? userRating : "Nessuno"}</span>
                </p>
                <StarRating
                  onRate={handleRating}
                  currentRating={userRating}
                  restaurantId={restaurantId}
                />
              </div>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-3">
              {/* Address */}
              <div className="flex gap-4 p-4 bg-white/10 rounded-lg border border-white/15">
                <MapPin size={20} className="text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Indirizzo</h3>
                  <p className="text-white/80 text-sm">{restaurant.address}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4 p-4 bg-white/10 rounded-lg border border-white/15">
                <Clock size={20} className="text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Orari</h3>
                  <p className="text-white/80 text-sm">
                    {restaurant.hours || "Lun-Dom: 12:00-23:00"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 p-4 bg-white/10 rounded-lg border border-white/15">
                <Phone size={20} className="text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Telefono</h3>
                  <p className="text-white/80 text-sm font-mono">
                    {restaurant.phone || "Non disponibile"}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {restaurant.specialties && restaurant.specialties.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-3">Specialità</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="bg-granata-100 dark:bg-granata-900 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Description Section */}
        {restaurant.description && (
          <motion.div
            className="mt-12 pt-8 border-t border-white/15"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <h3 className="text-2xl font-semibold text-white mb-4">
              Descrizione
            </h3>
            <p className="text-white/80 leading-relaxed text-lg">
              {restaurant.description}
            </p>
          </motion.div>
        )}

        {/* Gallery Section */}
        <motion.div
          className="mt-12 pt-8 border-t border-white/15"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white">
              Galleria Foto
            </h3>
            <label className="cursor-pointer px-4 py-2 bg-granata-500 text-white rounded-lg hover:bg-granata-600 transition-colors text-sm font-medium">
              + Aggiungi foto
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(galleryImages.length > 0 || (restaurant.images && restaurant.images.length > 0)) ? (
              <>
                {galleryImages.map((img, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="aspect-square bg-white/10 rounded-lg overflow-hidden shadow"
                  >
                    <img
                      src={img}
                      alt={`Foto aggiunta ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
                {restaurant.images && restaurant.images.map((img, idx) => (
                  <div
                    key={`original-${idx}`}
                    className="aspect-square bg-white/10 rounded-lg overflow-hidden shadow"
                  >
                    <img
                      src={img}
                      alt={`${restaurant.name} ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="col-span-full">
                <div className="aspect-video bg-white/10 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-white/20">
                  <p className="text-white/70 mb-4">
                    Nessuna foto ancora
                  </p>
                  <label className="cursor-pointer text-granata-500 hover:text-granata-600 font-medium text-sm">
                    Carica la prima foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      </motion.div>
    </div>
  );
}
