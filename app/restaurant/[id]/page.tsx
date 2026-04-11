"use client";

import { useState, useEffect } from "react";
import { Heart, Phone, Clock, MapPin, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import StarRating from "@/components/StarRating";

// Importa Map dinamicamente per evitare problemi di SSR
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />,
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
  phone: string;
  hours: string;
  specialties: string[];
  reviews: any[];
}

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export default function RestaurantDetail({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ author: "", rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    // Carica il ristorante
    fetch("/restaurants.json")
      .then((res) => res.json())
      .then((data) => {
        const rest = data.restaurants.find((r: any) => r.id === params.id);
        setRestaurant(rest);

        // Carica le recensioni
        const saved = localStorage.getItem(`reviews-${params.id}`);
        if (saved) setReviews(JSON.parse(saved));
      });

    // Controlla se è favorito
    const saved = localStorage.getItem("favorites");
    if (saved) {
      const favs = JSON.parse(saved);
      setIsFavorite(favs.includes(params.id));
    }
  }, [params.id]);

  const toggleFavorite = () => {
    const saved = localStorage.getItem("favorites");
    const favs = saved ? JSON.parse(saved) : [];
    const updated = favs.includes(params.id)
      ? favs.filter((f: string) => f !== params.id)
      : [...favs, params.id];
    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  const handleAddReview = () => {
    if (newReview.author.trim() && newReview.comment.trim()) {
      const review: Review = {
        id: Date.now().toString(),
        author: newReview.author.trim(),
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        date: new Date().toLocaleDateString("it-IT"),
      };
      const updated = [...reviews, review];
      setReviews(updated);
      localStorage.setItem(`reviews-${params.id}`, JSON.stringify(updated));
      setNewReview({ author: "", rating: 5, comment: "" });
      setShowReviewForm(false);
    }
  };

  const isReviewValid = newReview.author.trim() && newReview.comment.trim();

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-granata-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : restaurant.rating;

  return (
    <div className="min-h-screen bg-white">
      {/* Header con back button */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-granata-500 hover:text-granata-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <button
            onClick={toggleFavorite}
            className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-200 shadow-lg ${
              isFavorite
                ? "bg-granata-500 hover:bg-granata-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isFavorite
                  ? "fill-white text-white"
                  : "text-gray-400 hover:text-granata-500"
              }`}
            />
          </button>
        </div>

        {/* Info Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-3 py-1 bg-granata-50 text-granata-700 font-medium text-sm rounded-full">
                {restaurant.cuisine}
              </span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-gray-900">{avgRating}</span>
                <span className="text-gray-600 text-sm">({reviews.length})</span>
              </div>
              <span className="text-gray-700 font-medium text-sm">€{restaurant.priceRange}</span>
            </div>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed">{restaurant.description}</p>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-granata-500" />
                <span className="font-semibold text-gray-900">Telefono</span>
              </div>
              <a
                href={`tel:${restaurant.phone}`}
                className="text-granata-500 hover:text-granata-600 transition-colors"
              >
                {restaurant.phone}
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-granata-500" />
                <span className="font-semibold text-gray-900">Orari</span>
              </div>
              <p className="text-gray-600 text-sm">{restaurant.hours}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-granata-500" />
                <span className="font-semibold text-gray-900">Indirizzo</span>
              </div>
              <p className="text-gray-600 text-sm">{restaurant.address}</p>
            </div>
          </div>

          {/* Specialties */}
          {restaurant.specialties && restaurant.specialties.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Specialità</h2>
              <div className="flex flex-wrap gap-2">
                {restaurant.specialties.map((specialty, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-granata-50 text-granata-700 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Localizzazione</h2>
          <MapComponent address={restaurant.address} name={restaurant.name} />
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recensioni</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-granata-500 text-white rounded-lg hover:bg-granata-600 transition-colors font-medium"
            >
              {showReviewForm ? "Annulla" : "Scrivi Recensione"}
            </button>
          </div>

          {/* Form Recensione */}
          {showReviewForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={newReview.author}
                    onChange={(e) =>
                      setNewReview({ ...newReview, author: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500"
                    placeholder="Il tuo nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Voto ({newReview.rating}/10)
                  </label>
                  <div className="flex justify-center">
                    <StarRating
                      onRate={(rating) =>
                        setNewReview({ ...newReview, rating })
                      }
                      initialRating={newReview.rating}
                      interactive
                      size="lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commento
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500"
                    placeholder="Condividi la tua esperienza..."
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleAddReview}
                  disabled={!isReviewValid}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    isReviewValid
                      ? "bg-granata-500 text-white hover:bg-granata-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Pubblica Recensione
                </button>
              </div>
            </div>
          )}

          {/* Lista Recensioni */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{review.author}</p>
                      <p className="text-sm text-gray-600">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-600 text-center">
                  Nessuna recensione ancora. Sii il primo a condividere la tua esperienza!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
