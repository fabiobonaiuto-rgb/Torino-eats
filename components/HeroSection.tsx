'use client';

import { MinimalistHero } from '@/components/ui/minimalist-hero';

interface HeroSectionProps {
  restaurantCount: number;
}

export const HeroSection = ({ restaurantCount }: HeroSectionProps) => {
  return (
    <MinimalistHero
      logoText="Torino Eats"
      mainText="Scopri i migliori ristoranti autentici di Torino. Niente AI, niente trend generici. Solo vera cucina torinese."
      imageSrc="/mole-antonelliana.png"
      imageAlt="Mole Antonelliana di Torino"
      overlayText={{
        part1: 'Mangia',
        part2: 'bene',
      }}
      restaurantCount={restaurantCount}
      circleColor="#a81c39"
    />
  );
};
