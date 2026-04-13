"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  onRate: (rating: number) => void;
  currentRating?: number;
  restaurantId?: string;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  initialRating?: number;
}

export default function StarRating({
  onRate,
  currentRating = 0,
  restaurantId,
  interactive = true,
  size = "md",
  initialRating = 0,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const rating = currentRating || initialRating;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const handleClick = (index: number) => {
    const newRating = index + 1;
    onRate(newRating);
  };

  return (
    <div className="flex gap-1">
      {[...Array(10)].map((_, index) => {
        const isFilled = index < (hoverRating || rating);
        return (
          <button
            key={index}
            onClick={() => handleClick(index)}
            onMouseEnter={() => interactive && setHoverRating(index + 1)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={!interactive}
            className={`transition-all ${interactive ? "cursor-pointer" : "cursor-default"} ${
              isFilled ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${isFilled ? "fill-yellow-400" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
