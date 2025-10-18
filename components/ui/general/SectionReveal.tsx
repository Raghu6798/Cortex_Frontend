// components/ui/SectionReveal.tsx
'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface SectionRevealProps {
  children: React.ReactNode;
  delay?: number;
}

export function SectionReveal({ children, delay = 0 }: SectionRevealProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 }, // Start invisible and 50px down
        visible: { opacity: 1, y: 0 },   // Animate to fully visible at original position
      }}
      initial="hidden"
      whileInView="visible" // Trigger animation when it enters the viewport
      transition={{
        duration: 0.6,
        delay: delay,
        ease: 'easeOut',
      }}
      viewport={{
        once: true,    // Animate only once
        amount: 0.2,   // Trigger when 20% of the section is visible
      }}
    >
      {children}
    </motion.div>
  );
}