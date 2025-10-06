'use client';

import React from 'react';
import { CheckCircle, Zap, Users, Shield, BarChart, BookOpen } from 'lucide-react';

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string; desc: string }) => (
    <div className="rounded-xl border border-white/15 bg-black/30 p-6 backdrop-blur supports-[backdrop-filter]:bg-black/20">
      <div className="w-12 h-12 bg-purple-900/50 flex items-center justify-center rounded-lg">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-white/80">{desc}</p>
    </div>
);

export default function FeaturesSection() {
    return (
        <div className="py-24">
            <div className="text-center">
                <h2 className="text-sm font-semibold text-purple-400">Features</h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">Everything You Need, All in One Place</p>
                <p className="mt-6 mx-auto max-w-3xl text-lg text-white/80">
                    A comprehensive suite of tools designed for professional agent developers.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard icon={<Zap className="text-purple-400"/>} title="LLM Provider Switcher" desc="Swap between OpenAI, Anthropic, local models, or custom endpoints without code changes." />
                <FeatureCard icon={<BarChart className="text-purple-400"/>} title="Configurable Context Length" desc="Tune RAM (context window) per agent and track token usage in real time." />
                <FeatureCard icon={<Shield className="text-purple-400"/>} title="Postgres Persistence" desc="Durable memory and state storage with tenant isolation and migration-ready schema." />
                <FeatureCard icon={<BookOpen className="text-purple-400"/>} title="Multimodal Chat" desc="Image, video, docs, PDFs — drag & drop or paste. Unified interface for all." />
                <FeatureCard icon={<CheckCircle className="text-purple-400"/>} title="Web + MCP Tools" desc="Built-in web search and MCP servers for tool-augmented reasoning and retrieval." />
                <FeatureCard icon={<Users className="text-purple-400"/>} title="Multi-tenant Workspaces" desc="Sidebar chats, org-level controls, per-tenant limits, and memory availability display." />
            </div>
        </div>
    );
}