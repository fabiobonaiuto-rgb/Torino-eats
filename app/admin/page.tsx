"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Edit2, Save, X } from "lucide-react";
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
  phone: string;
  hours: string;
  specialties: string[];
}

interface NewRestaurant {
  name: string;
  address: string;
  cuisine: string;
  category: string;
  priceRange: string;
  phone: string;
  description: string;
}

export default function AdminPanel() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newRestaurant, setNewRestaurant] = useState<NewRestaurant>({
    name: "",
    address: "",
    cuisine: "",
    category: "",
    priceRange: "",
    phone: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Restaurant>>({});

  useEffect(() => {
    // Load restaurants
    fetch("/restaurants.json")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants);
        const cats = [...new Set(data.restaurants.map((r: Restaurant) => r.category))] as string[];
        setCategories(cats);
      });
  }, []);

  const addRestaurant = () => {
    if (!newRestaurant.name || !newRestaurant.address || !newRestaurant.category) {
      alert("Please fill in required fields");
      return;
    }

    const restaurant: Restaurant = {
      id: newRestaurant.name.toLowerCase().replace(/\s+/g, "-"),
      name: newRestaurant.name,
      category: newRestaurant.category,
      cuisine: newRestaurant.cuisine,
      description: newRestaurant.description,
      priceRange: newRestaurant.priceRange,
      rating: 7,
      image: "/images/placeholder.jpg",
      address: newRestaurant.address,
      phone: newRestaurant.phone,
      hours: "Lun-Dom: 11:00-23:00",
      specialties: [],
    };

    const updated = [...restaurants, restaurant];
    setRestaurants(updated);
    localStorage.setItem("newRestaurants", JSON.stringify(updated));
    setNewRestaurant({
      name: "",
      address: "",
      cuisine: "",
      category: "",
      priceRange: "",
      phone: "",
      description: "",
    });
  };

  const startEdit = (restaurant: Restaurant) => {
    setEditingId(restaurant.id);
    setEditValues({ ...restaurant });
  };

  const saveEdit = (id: string) => {
    const updated = restaurants.map((r) =>
      r.id === id ? { ...r, ...editValues } : r
    );
    setRestaurants(updated);
    localStorage.setItem("editedRestaurants", JSON.stringify(updated));
    setEditingId(null);
    setEditValues({});
  };

  const deleteRestaurant = (id: string) => {
    const updated = restaurants.filter((r) => r.id !== id);
    setRestaurants(updated);
    localStorage.setItem("deletedRestaurants", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-granata-500 hover:text-granata-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add New Restaurant */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Restaurant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Restaurant Name"
              value={newRestaurant.name}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, name: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500"
            />
            <input
              type="text"
              placeholder="Address"
              value={newRestaurant.address}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, address: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500"
            />
            <input
              type="text"
              placeholder="Cuisine Type"
              value={newRestaurant.cuisine}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500"
            />
            <select
              value={newRestaurant.category}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, category: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Price Range (e.g., 15-30)"
              value={newRestaurant.priceRange}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, priceRange: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newRestaurant.phone}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, phone: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500"
            />
            <textarea
              placeholder="Description"
              value={newRestaurant.description}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, description: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-granata-500 col-span-2"
              rows={3}
            />
          </div>
          <button
            onClick={addRestaurant}
            className="mt-6 px-6 py-3 bg-granata-500 text-white rounded-lg hover:bg-granata-600 transition-colors font-medium"
          >
            Add Restaurant
          </button>
        </div>

        {/* Restaurants List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">All Restaurants ({restaurants.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price Range</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{restaurant.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {editingId === restaurant.id ? (
                        <input
                          type="text"
                          value={editValues.address || ""}
                          onChange={(e) =>
                            setEditValues({ ...editValues, address: e.target.value })
                          }
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-granata-500"
                        />
                      ) : (
                        restaurant.address
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {editingId === restaurant.id ? (
                        <input
                          type="text"
                          value={editValues.priceRange || ""}
                          onChange={(e) =>
                            setEditValues({ ...editValues, priceRange: e.target.value })
                          }
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-granata-500"
                        />
                      ) : (
                        restaurant.priceRange
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{restaurant.category}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {editingId === restaurant.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(restaurant.id)}
                            className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(restaurant)}
                            className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRestaurant(restaurant.id)}
                            className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
