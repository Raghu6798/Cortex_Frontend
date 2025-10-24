'use client';

import Link from 'next/link';
import TextType from './TextType';
import Hyperspeed from './HyperSpeed';

export default function HeroSection() {
    return (
        // The main container sets the size (h-[600px]) and acts as the positioning context (relative).
        <div className="relative flex h-[600px] flex-col items-center justify-center px-6">
            
            {/* 2. Layer 1: The Hyperspeed Background */}
            {/* It is positioned absolutely to fill the entire container and sits on the base layer (z-0). */}
            <div className="absolute inset-0 w-full h-full z-0">
                <Hyperspeed 
                    effectOptions={{
                        onSpeedUp: () => { },
                        onSlowDown: () => { },
                        distortion: 'turbulentDistortion',
                        length: 400,
                        roadWidth: 10,
                        islandWidth: 2,
                        lanesPerRoad: 4,
                        fov: 90,
                        fovSpeedUp: 150,
                        speedUp: 2,
                        carLightsFade: 0.4,
                        totalSideLightSticks: 20,
                        lightPairsPerRoadWay: 40,
                        shoulderLinesWidthPercentage: 0.05,
                        brokenLinesWidthPercentage: 0.1,
                        brokenLinesLengthPercentage: 0.5,
                        lightStickWidth: [0.12, 0.5],
                        lightStickHeight: [1.3, 1.7],
                        movingAwaySpeed: [60, 80],
                        movingCloserSpeed: [-120, -160],
                        carLightsLength: [400 * 0.03, 400 * 0.2],
                        carLightsRadius: [0.05, 0.14],
                        carWidthPercentage: [0.3, 0.5],
                        carShiftX: [-0.8, 0.8],
                        carFloorSeparation: [0, 5],
                        colors: {
                            roadColor: 0x080808,
                            islandColor: 0x0a0a0a,
                            background: 0x000000,
                            shoulderLines: 0xFFFFFF,
                            brokenLines: 0xFFFFFF,
                            leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
                            rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
                            sticks: 0x03B3C3,
                        }
                    }}
                />
            </div>
            
            {/* A gradient overlay to darken the edges and ensure text is always readable */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            
            {/* 3. Layer 2: Your Hero Content */}
            {/* This content sits on a higher layer (z-20) to ensure it's on top of both the grid and the gradient. */}
            <div className="relative z-20 mx-auto max-w-6xl text-center">
                <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
                    <TextType
                        text={[
                            "Struggling to build AI agents?",
                            "Tired of managing multiple LLM providers?",
                            "Having a hard time configuring tools for the Agents and managing secrets?",
                            "Want to build voice agents but don't know where to start?",
                            "Need production-ready agent infrastructure?",
                            "Want to deploy agents at scale?"
                        ]}
                        typingSpeed={80}
                        deletingSpeed={40}
                        pauseDuration={2000}
                        loop={true}
                        className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                        showCursor={true}
                        cursorCharacter="|"
                        cursorClassName="text-white"
                        textColors={['#ffffff']}
                        variableSpeed={{ min: 50, max: 120 }}
                    />
                </h1>
                <p className="relative mt-4 mx-auto max-w-3xl text-lg text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                    Build, test, and deploy multi-tenant, multimodal AI agents with voice capabilities. Switch LLMs on the fly, tune context length, persist memory and state with Postgres, and integrate real-time voice interactions with LiveKit — all in one place.
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