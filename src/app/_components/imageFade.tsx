"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ImageFade({ className = "" }) {
  const slides = [
    "/images/teamPhotos/IMG_8020.JPG",
    "/images/teamPhotos/IMG_8181.JPG",
    "/images/teamPhotos/IMG_8203.JPG",
    "/images/teamPhotos/IMG_8258.JPG",
    "/images/teamPhotos/IMG_8284.JPG",
    "/images/teamPhotos/IMG_8415.JPG",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="relative h-full w-full">
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Image
              src={slides[currentSlide] ?? ""}
              alt={`Team photo ${currentSlide + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={currentSlide === 0}
            />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
