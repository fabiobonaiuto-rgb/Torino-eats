"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  onRate: (rating: number) => void;
  initialRating?: number;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  onRate,
  initialRating = 0,
  interactive = true,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || initialRating;

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`transition-all duration-150 ${
            interactive
              ? "cursor-pointer hover:scale-110"
              : "cursor-default"
          }`}
          disabled={!interactive}
        >
          <Star
            className={`${sizeClasses[size]} transition-colors duration-150 ${
              star <= displayRating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
