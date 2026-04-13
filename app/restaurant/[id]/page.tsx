"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Star, MapPin, Clock, Phone } from "lucide-react";
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
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [allRatings, setAllRatings] = useState<number[]>([]);
  const [averageRating, setAverageRating] = useState(0);

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
          const average = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;
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
    const average = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <p className="text-xl text-granata-500">Caricamento...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
        <p className="text-xl text-granata-500">Ristorante non trovato</p>
        <Link href="/" className="text-granata-500 hover:text-granata-600 flex items-center gap-2">
          <ArrowLeft size={20} />
          Torna alla home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
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
      <div className="border-b border-gray-200 dark:border-slate-800 animate-slide-up">
        <Link
          href="/"
          className="inline-flex items-center gap-2 p-4 text-granata-500 hover:text-granata-600 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Torna ai ristoranti
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content Grid - Image left, Info right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-slide-left stagger-1">
          {/* Left Column - Hero Image (col-span-2) */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="relative aspect-square bg-gray-200 dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg mb-4">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                {/* Favorite Button */}
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart
                    size={24}
                    className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Info (col-span-3) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header - Title & Category */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {restaurant.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {restaurant.cuisine}
                  </p>
                </div>
                <span className="bg-granata-100 dark:bg-granata-900 text-granata-700 dark:text-granata-200 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                  {restaurant.category}
                </span>
              </div>

              {/* Rating & Price */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {averageRating > 0 ? averageRating.toFixed(1) : restaurant.rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Fascia prezzo: <span className="font-semibold text-gray-900 dark:text-white">€{restaurant.priceRange}</span>
                </div>
              </div>

              {/* Your Rating */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Il tuo voto: <span className="text-granata-500">{userRating > 0 ? userRating : "Nessuno"}</span>
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
              <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <MapPin size={20} className="text-granata-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Indirizzo</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{restaurant.address}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <Clock size={20} className="text-granata-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Orari</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {restaurant.hours || "Lun-Dom: 12:00-23:00"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <Phone size={20} className="text-granata-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Telefono</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">
                    {restaurant.phone || "Non disponibile"}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {restaurant.specialties && restaurant.specialties.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Specialità</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="bg-granata-100 dark:bg-granata-900 text-granata-700 dark:text-granata-200 px-3 py-1 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        {restaurant.description && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Descrizione
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              {restaurant.description}
            </p>
          </div>
        )}

        {/* Gallery Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800 animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
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
                    className="aspect-square bg-gray-200 dark:bg-slate-800 rounded-lg overflow-hidden shadow"
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
                    className="aspect-square bg-gray-200 dark:bg-slate-800 rounded-lg overflow-hidden shadow"
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
                <div className="aspect-video bg-gray-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
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
        </div>
      </div>
    </div>
  );
}
