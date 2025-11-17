'use client';

import React from 'react';
import { CheckCircle, Zap, Users, Shield, BarChart, BookOpen, Mic, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const FeatureCard = ({ icon, title, desc, isDarkMode }: { icon: React.ReactNode, title: string; desc: string; isDarkMode: boolean }) => (
    <div className={cn(
      "rounded-xl border p-6 backdrop-blur",
      isDarkMode 
        ? "border-white/15 bg-black/30 supports-[backdrop-filter]:bg-black/20" 
        : "border-black/15 bg-white/50 supports-[backdrop-filter]:bg-white/30"
    )}>
      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-lg",
        isDarkMode ? "bg-purple-900/50" : "bg-purple-100"
      )}>{icon}</div>
      <h3 className={cn("mt-4 text-lg font-semibold", isDarkMode ? "text-white" : "text-black")}>{title}</h3>
      <p className={cn("mt-1 text-sm", isDarkMode ? "text-white/80" : "text-black/80")}>{desc}</p>
    </div>
);

interface FeaturesSectionProps {
  isDarkMode?: boolean;
}

export default function FeaturesSection({ isDarkMode = true }: FeaturesSectionProps) {
    return (
        <div className="py-24">
            <div className="text-center">
                <h2 className={cn("text-sm font-semibold", isDarkMode ? "text-purple-400" : "text-purple-600")}>Features</h2>
                <p className={cn("mt-2 text-4xl font-bold tracking-tight sm:text-5xl", isDarkMode ? "text-white" : "text-black")}>Everything You Need, All in One Place</p>
                <p className={cn("mt-6 mx-auto max-w-3xl text-lg", isDarkMode ? "text-white/80" : "text-black/80")}>
                    A comprehensive suite of tools designed for professional agent developers.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard isDarkMode={isDarkMode} icon={<Zap className={isDarkMode ? "text-purple-400" : "text-purple-600"}/>} title="LLM Provider Switcher" desc="Swap between OpenAI, Anthropic, local models, or custom endpoints without code changes." />
                <FeatureCard isDarkMode={isDarkMode} icon={<BarChart className={isDarkMode ? "text-purple-400" : "text-purple-600"}/>} title="Configurable Context Length" desc="Tune RAM (context window) per agent and track token usage in real time." />
                <FeatureCard isDarkMode={isDarkMode} icon={<Shield className={isDarkMode ? "text-purple-400" : "text-purple-600"}/>} title="Postgres Persistence" desc="Durable memory and state storage with tenant isolation and migration-ready schema." />
                <FeatureCard isDarkMode={isDarkMode} icon={<BookOpen className={isDarkMode ? "text-purple-400" : "text-purple-600"}/>} title="Multimodal Chat" desc="Image, video, docs, PDFs — drag & drop or paste. Unified interface for all." />
                <FeatureCard isDarkMode={isDarkMode} icon={<Mic className={isDarkMode ? "text-purple-400" : "text-purple-600"}/>} title="Voice Agents with LiveKit" desc="Build production-grade voice AI agents with real-time audio, video, and data streams using LiveKit integration." />
                <FeatureCard isDarkMode={isDarkMode} icon={<Phone className={isDarkMode ? "text-purple-400" : "text-purple-600"}/>} title="Telephony Integration" desc="Deploy voice agents for call centers, telehealth, and customer service with SIP integration support." />
                <FeatureCard isDarkMode={isDarkMode} icon={<CheckCircle className={isDarkMode ? "text-purple-400" : "text-purple-600"}/>} title="Web + MCP Tools" desc="Built-in web search and MCP servers for tool-augmented reasoning and retrieval." />
                <FeatureCard isDarkMode={isDarkMode} icon={<Users className={isDarkMode ? "text-purple-400" : "text-purple-600"}/>} title="Multi-tenant Workspaces" desc="Sidebar chats, org-level controls, per-tenant limits, and memory availability display." />
            </div>
        </div>
    );
}