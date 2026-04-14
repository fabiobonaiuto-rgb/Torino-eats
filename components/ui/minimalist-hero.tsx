'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, MapPin, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MinimalistHeroProps {
  logoText: string;
  titleText?: string;
  mainText: string;
  imageSrc: string;
  imageAlt: string;
  overlayText: {
    part1: string;
    part2: string;
  };
  restaurantCount: number;
  circleColor?: string;
  className?: string;
  onAddRestaurant?: () => void;
}

export const MinimalistHero = ({
  logoText,
  titleText,
  mainText,
  imageSrc,
  imageAlt,
  overlayText,
  restaurantCount,
  circleColor = '#a81c39',
  className,
  onAddRestaurant,
}: MinimalistHeroProps) => {
  const router = useRouter();
  const displayTitleText = titleText || logoText;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div
      className={cn(
        'relative w-full min-h-[100dvh] overflow-hidden font-sans',
        className
      )}
      style={{
        background: 'linear-gradient(to bottom, #B80036 0%, #520018 69%)'
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={imageSrc}
          alt={imageAlt}
          className="absolute h-full w-auto max-w-none object-contain top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ maxHeight: '100vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://placehold.co/1920x1080/${circleColor.slice(1)}/ffffff?text=Image+Not+Found`;
          }}
        />
        {/* Radial Gradient Overlay for Depth */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)'
          }}
        />
      </div>

      {/* Header: Logo (Left) + Icons (Right) */}
      <div className="relative z-40 flex items-center justify-between px-6 md:px-8 lg:px-12 py-6 md:py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl font-semibold text-white tracking-wide"
        >
          {logoText}.
        </motion.div>

        {/* Desktop: Icon Buttons - Pill Container */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/40 hover:border-white/60 transition-all duration-300 hover:bg-white/5"
        >
          {/* Plus Button - Rotates 90 degrees */}
          <motion.button
            onClick={onAddRestaurant}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300"
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
            aria-label="Aggiungi ristorante"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={1.5} />
          </motion.button>

          {/* Heart Button - Beats */}
          <motion.button
            onClick={() => router.push('/favorites')}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300"
            whileHover="hover"
            aria-label="Visualizza preferiti"
          >
            <motion.div
              variants={{
                hover: {
                  scale: [1, 1.2, 0.95, 1.15, 1],
                  transition: { duration: 0.6, repeat: Infinity }
                }
              }}
            >
              <Heart className="w-5 h-5 text-white" strokeWidth={1.5} />
            </motion.div>
          </motion.button>

          {/* MapPin Button - Center circle fills with white */}
          <motion.button
            onClick={() => router.push('/map')}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300"
            whileHover="hover"
            aria-label="Visualizza mappa"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
              <motion.circle
                cx="12"
                cy="10"
                r="3"
                variants={{
                  hover: {
                    fill: "#ffffff",
                    transition: { duration: 0.3 }
                  }
                }}
              />
            </svg>
          </motion.button>
        </motion.div>

        {/* Mobile: Menu Button */}
        <motion.div className="md:hidden relative">
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-white" strokeWidth={1.5} />
          </motion.button>

          {/* Mobile Dropdown Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={mobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden min-w-[180px] ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <motion.button
              onClick={() => {
                onAddRestaurant?.();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left flex items-center gap-3 border-b border-white/10"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} />
              Aggiungi Ristorante
            </motion.button>
            <motion.button
              onClick={() => {
                router.push('/favorites');
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left flex items-center gap-3 border-b border-white/10"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              Preferiti
            </motion.button>
            <motion.button
              onClick={() => {
                router.push('/map');
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-left flex items-center gap-3"
            >
              <MapPin className="w-5 h-5" strokeWidth={1.5} />
              Mappa
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content: Left + Center + Right */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 md:px-8 lg:px-12 pt-24 md:pt-0">
        {/* LEFT: Esplora Torino - Absolute Bottom Left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden md:flex flex-col justify-start w-1/3 max-w-xs absolute bottom-12 left-6 md:left-8 lg:left-12"
        >
          <h3 className="text-white/90 leading-relaxed mb-4 font-semibold text-base md:text-lg">
            Esplora Torino
          </h3>
          <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-6 max-w-[250px]">
            {mainText}
          </p>
          <div>
            <div className="text-5xl md:text-6xl font-bold text-white leading-none">
              {restaurantCount}
            </div>
            <p className="text-xs md:text-sm text-white/70 mt-2 font-light">
              Ristoranti
            </p>
          </div>
        </motion.div>

        {/* CENTER: "Torino Eats." Large Italic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
        >
          <h1
            className="text-white leading-none font-light"
            style={{
              fontSize: 'clamp(5rem, 22vw, 13rem)',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
              letterSpacing: '-0.03em',
              fontWeight: 300,
            }}
          >
            {displayTitleText}.
          </h1>
        </motion.div>

        {/* RIGHT: Mangia Bene - Absolute Bottom Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden md:flex flex-col items-end justify-start w-1/3 absolute bottom-12 right-6 md:right-8 lg:right-12"
        >
          <h2
            className="text-white leading-tight"
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.5rem, 5vw, 3rem)',
              fontWeight: 300,
              letterSpacing: '-0.03em',
            }}
          >
            Mangia Bene
          </h2>
        </motion.div>
      </div>

      {/* Mobile: Only Restaurant Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="md:hidden absolute bottom-0 left-0 right-0 z-20 px-6 pb-12 text-center"
      >
        <div>
          <div className="text-5xl font-bold text-white">{restaurantCount}</div>
          <p className="text-sm text-white/70 mt-2">Ristoranti</p>
        </div>
      </motion.div>
    </div>
  );
};
