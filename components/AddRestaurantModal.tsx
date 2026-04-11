"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (restaurant: {
    name: string;
    address: string;
    image: string;
    category: string;
  }) => void;
  categories: string[];
}

export default function AddRestaurantModal({
  isOpen,
  onClose,
  onAdd,
  categories,
}: AddRestaurantModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    image: "",
    category: categories[0] || "",
  });
  const [imagePreview, setImagePreview] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.address && formData.image && formData.category) {
      onAdd(formData);
      setFormData({
        name: "",
        address: "",
        image: "",
        category: categories[0] || "",
      });
      setImagePreview("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Aggiungi un Locale</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nome del Locale
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Es. Ristorante da Mario"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500 focus:ring-2 focus:ring-granata-100 transition-all"
              required
            />
          </div>

          {/* Via/Indirizzo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Via e Numero Civico
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Es. Via Roma 123, 10100 Torino"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500 focus:ring-2 focus:ring-granata-100 transition-all"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500 focus:ring-2 focus:ring-granata-100 transition-all"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Foto del Locale
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-granata-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
                required={!imagePreview}
              />
              <label
                htmlFor="image-input"
                className="cursor-pointer block"
              >
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-gray-600">
                      Clicca per cambiare foto
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl text-gray-400">📸</div>
                    <p className="text-sm font-medium text-gray-700">
                      Clicca per aggiungere una foto
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF fino a 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={
                !formData.name ||
                !formData.address ||
                !imagePreview ||
                !formData.category
              }
              className="flex-1 px-4 py-3 bg-granata-500 text-white font-medium rounded-lg hover:bg-granata-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Aggiungi Locale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
