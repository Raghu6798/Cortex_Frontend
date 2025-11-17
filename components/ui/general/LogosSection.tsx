'use client';

import React, { forwardRef, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedBeam } from './AnimatedBeamComponent'; // Ensure this path is correct
import Image from 'next/image';

// --- Reusable Circle component from your example ---
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; isDarkMode?: boolean }
>(({ className, children, isDarkMode = true }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-14 items-center justify-center rounded-full border-2 p-2.5 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        isDarkMode 
          ? 'border-neutral-700 bg-neutral-900' 
          : 'border-neutral-300 bg-neutral-100',
        className,
      )}
    >
      {children}
    </div>
  );
});
Circle.displayName = 'Circle';

// --- Define your logo data ---
const inputLogos = [
  'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png',
  'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/llamaindex-color.png',
  'https://google.github.io/adk-docs/assets/agent-development-kit.png',
  'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langgraph-color.png',
  'https://pbs.twimg.com/profile_images/1884966723746435073/x0p8ngPD_400x400.jpg',
];


const outputLogos = [
  'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/mcp.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/640px-Postgresql_elephant.svg.png',
];

interface LogosSectionProps {
  isDarkMode?: boolean;
}

export default function LogosSection({ isDarkMode = true }: LogosSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create refs for a grid layout
  const topLeftRef = useRef<HTMLDivElement>(null);
  const topMiddleRef = useRef<HTMLDivElement>(null);
  const topRightRef = useRef<HTMLDivElement>(null);
  const middleLeftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null); // Your App Logo
  const middleRightRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);

  // Map logos to refs for easier beam creation
  const inputRefs = [topLeftRef, topMiddleRef, topRightRef, middleRightRef, bottomRightRef];
  const outputRefs = [middleLeftRef, bottomLeftRef];

  return (
    <section className="w-full py-20">
      <div className="container mx-auto max-w-7xl px-6 text-center">
        <h2 className={cn("text-sm font-semibold tracking-widest uppercase", isDarkMode ? "text-white/60" : "text-black/60")}>
          A UNIFIED, INTEGRATED BACKEND
        </h2>
        <p className={cn("mt-2 text-3xl font-bold tracking-tight sm:text-4xl", isDarkMode ? "text-white" : "text-black")}>
          Connect Your Entire AI Stack
        </p>

        <div
          className={cn(
            "relative mt-12 flex h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border p-10",
            isDarkMode 
              ? "border-white/10 bg-black/50" 
              : "border-black/10 bg-white/50"
          )}
          ref={containerRef}
        >
          <div className="grid h-full w-full max-w-lg grid-cols-3 grid-rows-3 items-center justify-items-center">
            {/* Row 1 */}
            <Circle ref={topLeftRef} isDarkMode={isDarkMode}><Image src={inputLogos[0]} alt="Logo 1" width={40} height={40} className="max-h-full w-auto object-contain"/></Circle>
            <Circle ref={topMiddleRef} isDarkMode={isDarkMode}><Image src={inputLogos[1]} alt="Logo 2" width={40} height={40} className="max-h-full w-auto object-contain"/></Circle>
            <Circle ref={topRightRef} isDarkMode={isDarkMode}><Image src={inputLogos[2]} alt="Logo 3" width={40} height={40} className="max-h-full w-auto object-contain"/></Circle>
            
            {/* Row 2 */}
            <Circle ref={middleLeftRef} isDarkMode={isDarkMode}><Image src={outputLogos[0]} alt="Output 1" width={40} height={40} className="max-h-full w-auto object-contain"/></Circle>
            <Circle ref={centerRef} isDarkMode={isDarkMode} className="size-20 p-3"><Image src="/download.png" alt="Agenta Logo" width={64} height={64} className="rounded-sm" /></Circle>
            <Circle ref={middleRightRef} isDarkMode={isDarkMode}><Image src={inputLogos[3]} alt="Logo 4" width={40} height={40} className="max-h-full w-auto object-contain"/></Circle>

            {/* Row 3 */}
            <Circle ref={bottomLeftRef} isDarkMode={isDarkMode}><Image src={outputLogos[1]} alt="Output 2" width={40} height={40} className="max-h-full w-auto object-contain"/></Circle>
            <div></div> {/* Empty cell for alignment */}
            <Circle ref={bottomRightRef} isDarkMode={isDarkMode}><Image src={inputLogos[4]} alt="Logo 5" width={40} height={40} className="max-h-full w-auto object-contain"/></Circle>
          </div>

          {/* AnimatedBeams connecting the nodes */}
          {/* Beams from inputs TO center */}
          {inputRefs.map((ref, index) => (
            <AnimatedBeam
              key={`beam-in-${index}`}
              containerRef={containerRef}
              fromRef={ref}
              toRef={centerRef}
              duration={3}
              delay={index * 0.2}
            />
          ))}

          {/* Beams from center TO outputs (reversed) */}
          {outputRefs.map((ref, index) => (
            <AnimatedBeam
              key={`beam-out-${index}`}
              containerRef={containerRef}
              fromRef={centerRef}
              toRef={ref}
              duration={3}
              delay={1 + index * 0.3} // Delay to start after inputs
              reverse // The beam animates from 'from' to 'to', but visually flows the other way
            />
          ))}
        </div>
      </div>
    </section>
  );
}

