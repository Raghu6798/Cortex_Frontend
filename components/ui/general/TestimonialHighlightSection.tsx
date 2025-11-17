'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialHighlightSectionProps {
  isDarkMode?: boolean;
}

export default function TestimonialHighlightSection({ isDarkMode = true }: TestimonialHighlightSectionProps) {
  return (
    <div className="py-24 text-center">
      <div className={cn("flex justify-center gap-1", isDarkMode ? "text-yellow-400" : "text-yellow-600")}>
        <Star fill="currentColor" />
        <Star fill="currentColor" />
        <Star fill="currentColor" />
        <Star fill="currentColor" />
        <Star fill="currentColor" />
      </div>
      <blockquote className={cn("mt-6 mx-auto max-w-4xl text-2xl font-medium leading-relaxed", isDarkMode ? "text-white/90" : "text-black/90")}>
        {/* --- FIX: Replaced ' with &apos; --- */}
        &quot;Cortex has fundamentally changed how we approach AI development. It&apos;s the essential backend for any serious agent-based application.&quot;
      </blockquote>
      <div className="mt-6">
        <p className={cn("font-semibold", isDarkMode ? "text-white" : "text-black")}>Alex Johnson</p>
        <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-black/60")}>Head of AI, QuantumLeap Dynamics</p>
      </div>
    </div>
  );
}
