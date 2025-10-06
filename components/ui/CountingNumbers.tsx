// components/ui/CountingNumbers.tsx
"use client";

import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils"; // Ensure this path is correct

export interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const NumberTicker = ({
  value,
  direction = "up",
  delay = 0,
  className,
  suffix,
  prefix,
}: NumberTickerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  
  // Spring animation for a smooth, natural count-up effect
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  // This hook detects when the component is visible on the screen
  const isInView = useInView(ref, { once: true, margin: "0px" });

  // This effect triggers the animation once the component is in view
  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay);
    }
  }, [motionValue, isInView, delay, value, direction]);

  // This effect updates the text content of the span element as the spring value changes
  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = 
          (prefix || "") + 
          // Format numbers with commas (e.g., 1,834,927) and handle decimals
          Intl.NumberFormat("en-US", { 
            minimumFractionDigits: value % 1 === 0 ? 0 : 1,
            maximumFractionDigits: value % 1 === 0 ? 0 : 1
          }).format(latest) + 
          (suffix || "");
      }
    });
  }, [springValue, suffix, prefix, value]);

  return (
    <span
      className={cn("inline-block tabular-nums", className)}
      ref={ref}
    />
  );
};