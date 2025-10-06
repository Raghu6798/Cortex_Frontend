'use client';

import { Star } from 'lucide-react';

export default function TestimonialHighlightSection() {
  return (
    <div className="py-24 text-center">
      <div className="flex justify-center gap-1 text-yellow-400">
        <Star fill="currentColor" />
        <Star fill="currentColor" />
        <Star fill="currentColor" />
        <Star fill="currentColor" />
        <Star fill="currentColor" />
      </div>
      <blockquote className="mt-6 mx-auto max-w-4xl text-2xl font-medium leading-relaxed text-white/90">
        {/* --- FIX: Replaced ' with &apos; --- */}
        &quot;Cortex has fundamentally changed how we approach AI development. It&apos;s the essential backend for any serious agent-based application.&quot;
      </blockquote>
      <div className="mt-6">
        <p className="font-semibold text-white">Alex Johnson</p>
        <p className="text-sm text-white/60">Head of AI, QuantumLeap Dynamics</p>
      </div>
    </div>
  );
}
