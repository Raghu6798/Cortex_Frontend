"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Shield, 
  Rocket, 
  Cpu, 
  Database,
  GitBranch,
  Layers,
  Target,
  Sparkles
} from 'lucide-react';

interface ChallengeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  size: 'small' | 'medium' | 'large';
  delay?: number;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  title, 
  description, 
  icon, 
  gradient, 
  size,
  delay = 0 
}) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-2',
    large: 'col-span-2 row-span-2'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} group relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:scale-[1.02]`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
    >
      {/* Gradient Background */}
      <div 
        className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${gradient}`}
      />
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        <div>
          <div className="mb-4 text-white/80 group-hover:text-white transition-colors duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors duration-300">
            {title}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
            {description}
          </p>
        </div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </motion.div>
  );
};

const ChallengeBentoGrid: React.FC = () => {
  const challenges = [
    {
      title: "Complex Agent Orchestration",
      description: "Managing multiple AI agents with different capabilities, ensuring they work together seamlessly in complex workflows.",
      icon: <Brain className="w-8 h-8" />,
      gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
      size: "large" as const,
      delay: 0.1
    },
    {
      title: "Real-time Performance",
      description: "Achieving sub-second response times while maintaining accuracy across different LLM providers.",
      icon: <Zap className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20",
      size: "medium" as const,
      delay: 0.2
    },
    {
      title: "Security & Compliance",
      description: "Ensuring data privacy and meeting regulatory requirements in multi-tenant environments.",
      icon: <Shield className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      size: "small" as const,
      delay: 0.3
    },
    {
      title: "Scalable Infrastructure",
      description: "Building systems that can handle millions of requests while maintaining reliability.",
      icon: <Rocket className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
      size: "small" as const,
      delay: 0.4
    },
    {
      title: "Provider Management",
      description: "Seamlessly switching between different LLM providers without code changes or downtime.",
      icon: <Cpu className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-red-500/20 to-pink-500/20",
      size: "medium" as const,
      delay: 0.5
    },
    {
      title: "Memory Persistence",
      description: "Maintaining context and state across sessions with robust database integration.",
      icon: <Database className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
      size: "small" as const,
      delay: 0.6
    },
    {
      title: "Workflow Complexity",
      description: "Designing intuitive interfaces for complex agent workflows that non-technical users can understand.",
      icon: <GitBranch className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-teal-500/20 to-blue-500/20",
      size: "small" as const,
      delay: 0.7
    },
    {
      title: "Monitoring & Observability",
      description: "Tracking performance, costs, and usage patterns across all agents and providers.",
      icon: <Layers className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
      size: "medium" as const,
      delay: 0.8
    },
    {
      title: "Precision & Accuracy",
      description: "Ensuring agents deliver accurate results while handling edge cases and unexpected inputs.",
      icon: <Target className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-amber-500/20 to-yellow-500/20",
      size: "small" as const,
      delay: 0.9
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-purple-400 font-medium">Challenges We Solve</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          The Complex World of 
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> AI Agents</span>
        </h2>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Building production-ready AI agents comes with unique challenges. Here&apos;s what we help you overcome.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
        {challenges.map((challenge, index) => (
          <ChallengeCard
            key={index}
            title={challenge.title}
            description={challenge.description}
            icon={challenge.icon}
            gradient={challenge.gradient}
            size={challenge.size}
            delay={challenge.delay}
          />
        ))}
      </div>

    </div>
  );
};

export default ChallengeBentoGrid;
