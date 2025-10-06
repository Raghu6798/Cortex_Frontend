'use client';

import Link from 'next/link';
// 1. Import your new GridDistortion component
import GridDistortion from './GridDistortion';

export default function HeroSection() {
    return (
        // The main container sets the size (h-[600px]) and acts as the positioning context (relative).
        <div className="relative flex h-[600px] flex-col items-center justify-center px-6">
            
            {/* 2. Layer 1: The GridDistortion Background */}
            {/* It is positioned absolutely to fill the entire container and sits on the base layer (z-0). */}
            <GridDistortion
                // Using a dark, abstract image for a subtle effect that matches your screenshot.
                imageSrc="https://images.unsplash.com/photo-1599237651336-e65a73546777?&auto=format&fit=crop&w=1920&q=80"
                grid={15}
                mouse={0.1}
                strength={0.15}
                relaxation={0.9}
                className="absolute inset-0 w-full h-full z-0"
            />
            
            {/* A gradient overlay to darken the edges and ensure text is always readable */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            
            {/* 3. Layer 2: Your Hero Content */}
            {/* This content sits on a higher layer (z-20) to ensure it's on top of both the grid and the gradient. */}
            <div className="relative z-20 mx-auto max-w-6xl text-center">
                <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
                    Build Production-Grade AI Agents, Unified.
                </h1>
                <p className="relative mt-4 mx-auto max-w-3xl text-lg text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                    Build, test, and deploy multi-tenant, multimodal AI agents. Switch LLMs on the fly, tune context length, and persist memory and state with Postgres — all in one place.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Link href="/dashboard" className="rounded-lg bg-white px-6 py-3 font-medium text-black shadow-lg hover:bg-white/90 transition-transform hover:scale-105">
                        Open Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}