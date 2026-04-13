"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

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

interface EditRestaurantModalProps {
  isOpen: boolean;
  restaurant: Restaurant | null;
  onClose: () => void;
  onSave: (restaurant: Restaurant) => void;
  categories: string[];
}

export default function EditRestaurantModal({
  isOpen,
  restaurant,
  onClose,
  onSave,
  categories,
}: EditRestaurantModalProps) {
  const [formData, setFormData] = useState<Restaurant | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (restaurant) {
      setFormData(restaurant);
      setImagePreview(restaurant.image);
    }
  }, [restaurant]);

  if (!isOpen || !formData) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImagePreview(dataUrl);
        setFormData({ ...formData, image: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.address &&
      formData.description &&
      formData.cuisine &&
      formData.category
    ) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 flex justify-between items-center p-6">
          <h2 className="text-2xl font-bold text-gray-900">Modifica ristorante</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Nome del ristorante"
            />
          </div>

          {/* Indirizzo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indirizzo
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Via e civico"
            />
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Descrizione del ristorante"
            />
          </div>

          {/* Cucina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cucina
            </label>
            <input
              type="text"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Es. Piemontese, Vegetariana"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Fascia di prezzo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fascia di prezzo (€)
            </label>
            <input
              type="text"
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Es. 15-25"
            />
          </div>

          {/* Telefono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefono (opzionale)
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Es. +39 011 123456"
            />
          </div>

          {/* Orari */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orari (opzionale)
            </label>
            <input
              type="text"
              name="hours"
              value={formData.hours || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Es. Lun-Dom: 11:00-23:00"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto (opzionale)
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Coordinate */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Coordinate (opzionale)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitudine
                </label>
                <input
                  type="number"
                  name="lat"
                  value={formData.lat || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lat: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  step="0.00001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Es. 45.0705"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitudine
                </label>
                <input
                  type="number"
                  name="lng"
                  value={formData.lng || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lng: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  step="0.00001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Es. 7.6868"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Inserisci le coordinate GPS del ristorante. Es: Torino è intorno a 45.07° N, 7.69° E
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              style={{ backgroundColor: "#a81c39" }}
              className="flex-1 px-4 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Salva modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
