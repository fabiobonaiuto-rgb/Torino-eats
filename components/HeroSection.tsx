'use client';

import { MinimalistHero } from '@/components/ui/minimalist-hero';

interface HeroSectionProps {
  restaurantCount: number;
  onAddRestaurant?: () => void;
}

export const HeroSection = ({ restaurantCount, onAddRestaurant }: HeroSectionProps) => {
  return (
    <MinimalistHero
      logoText="Torino Eats"
      titleText="Turin Eats"
      mainText="Scopri i migliori ristoranti autentici di Torino. Niente AI, niente trend generici. Solo vera cucina torinese."
      imageSrc="https://cdn.jsdelivr.net/gh/fabiobonaiuto-rgb/Torino-eats@main/public/mole-antonelliana.png"
      imageAlt="Mole Antonelliana di Torino"
      overlayText={{
        part1: 'Mangia',
        part2: 'bene',
      }}
      restaurantCount={restaurantCount}
      circleColor="#a81c39"
      onAddRestaurant={onAddRestaurant}
    />
  );
};
