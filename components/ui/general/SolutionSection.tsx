'use client';

// 1. Import your new NeonGradientCard component
import { NeonGradientCard } from './NeonGradientCard';
import { cn } from '@/lib/utils';

interface SolutionSectionProps {
  isDarkMode?: boolean;
}

export default function SolutionSection({ isDarkMode = true }: SolutionSectionProps) {
    return (
        // Keep the outer div for section-level padding
        <div className="py-24">
            {/* 2. Replace the old container with NeonGradientCard */}
            {/* We will customize the colors and radius to match your site's theme */}
            <NeonGradientCard
                className="w-full"
                neonColors={{
                    firstColor: '#a855f7', // Your theme's purple
                    secondColor: '#9333ea', // A slightly different purple for the gradient
                }}
                borderRadius={24} // Corresponds to Tailwind's rounded-3xl
            >
                {/* 3. All original content now goes inside the card as children */}
                {/* The card provides its own background and padding */}
                <div className="text-center">
                    <h2 className={cn("text-sm font-semibold", isDarkMode ? "text-purple-400" : "text-purple-600")}>The Solution</h2>
                    <p className={cn("mt-2 text-4xl font-bold tracking-tight sm:text-5xl", isDarkMode ? "text-white" : "text-black")}>
                        Cortex: The Unified Agent Backend
                    </p>
                    <p className={cn("mt-6 mx-auto max-w-3xl text-lg", isDarkMode ? "text-white/80" : "text-black/80")}>
                        Cortex provides a single, unified platform for building production-grade agents with best practices baked in. Think of it as a Backend-as-a-Service, but designed specifically for the unique needs of AI agent development.
                    </p>
                </div>
            </NeonGradientCard>
        </div>
    );
}