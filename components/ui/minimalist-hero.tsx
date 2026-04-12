'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MinimalistHeroProps {
  logoText: string;
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
}

export const MinimalistHero = ({
  logoText,
  mainText,
  imageSrc,
  imageAlt,
  overlayText,
  restaurantCount,
  circleColor = '#a81c39',
  className,
}: MinimalistHeroProps) => {
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  // Design token mapping for colors
  const colorStyle = { '--circle-color': circleColor } as React.CSSProperties;

  return (
    <div
      className={cn(
        'relative w-full min-h-[100dvh] overflow-hidden bg-white font-sans',
        className
      )}
      style={colorStyle}
    >
      {/* Background layer with circle and image - centered context */}
      <div className="absolute inset-0">
        {/* Cerchio dietro - centered */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="absolute z-5 h-96 w-96 md:h-[600px] md:w-[600px] lg:h-[700px] lg:w-[700px] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ backgroundColor: circleColor, willChange: "transform, opacity" }}
        ></motion.div>

        {/* Image - Centered, in primo piano, non tagliata */}
        <motion.img
          src={imageSrc}
          alt={imageAlt}
          className="absolute h-full w-auto max-w-none object-contain z-10 top-1/2 left-[45%] md:left-[48%] -translate-x-1/2 -translate-y-1/2"
          style={{ maxHeight: '100vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://placehold.co/1920x1080/a81c39/ffffff?text=Image+Not+Found`;
          }}
        />
      </div>

      {/* Logo - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8 left-8 z-40 text-xl font-bold tracking-wider cursor-pointer"
        style={{ color: circleColor, perspective: "1000px" }}
        onMouseEnter={() => setIsLogoHovered(true)}
        onMouseLeave={() => setIsLogoHovered(false)}
      >
        <AnimatePresence mode="wait">
          {!isLogoHovered ? (
            <motion.span
              key="torino-eats"
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              style={{ display: "inline-block" }}
            >
              Torino Eats
            </motion.span>
          ) : (
            <motion.span
              key="eats-good"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              style={{ display: "inline-block" }}
            >
              Eats Good
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Left Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden md:flex flex-col justify-center w-1/3 pr-4"
          role="region"
          aria-label="Restaurant information"
        >
          <p className="leading-relaxed text-gray-900 max-w-xs" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
            {mainText}
          </p>
          <div className="mt-8">
            <div
              className="font-extrabold text-gray-900"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
              aria-label={`${restaurantCount} restaurants available`}
            >
              {restaurantCount}
            </div>
            <p className="font-medium text-gray-900 mt-3" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
              Ristoranti
            </p>
          </div>
        </motion.div>

        {/* Right Text Overlay - Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-end md:items-center justify-center md:justify-end w-full md:w-1/3 pl-5 pt-28 md:pt-0"
          role="region"
          aria-label="Restaurant discovery tagline"
        >
          <h1
            className="font-extrabold text-white md:text-gray-900 leading-none text-center md:text-right max-w-xs"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
          >
            {overlayText.part1}
            <br />
            {overlayText.part2}
          </h1>
        </motion.div>
      </div>
    </div>
  );
};
