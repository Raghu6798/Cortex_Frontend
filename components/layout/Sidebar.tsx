// components/layout/Sidebar.tsx
'use client';

import React from 'react';
import {
  Database,
  FileJson,
  MessageSquare,
  PlusCircle,
  Puzzle,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SidebarProps {
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNewAgentClick: () => void; // New prop to handle click
}

const Sidebar = ({ isExpanded, onMouseEnter, onMouseLeave, onNewAgentClick }: SidebarProps) => {
  const features = [
    { name: 'LLM Provider Switching', icon: Puzzle },
    { name: 'Agent Runtime & Files', icon: FileJson },
    { name: 'Multi-Tenant UI', icon: MessageSquare },
    { name: 'Persistence (Postgres)', icon: Database }
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full border-r border-white/10 hidden lg:flex flex-col z-30',
        'transition-all duration-300 ease-in-out',
        isExpanded ? 'w-64' : 'w-20'
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center justify-center h-20 border-b border-white/10 flex-shrink-0">
        <Link href="/">
  <Image
    src="/download.png"
    alt="Agenta Logo"
    width={32}
    height={32}
    className="rounded-sm cursor-pointer"
  />
</Link>
        <span
          className={cn(
            'font-semibold tracking-widest text-lg ml-3 overflow-hidden whitespace-nowrap',
            'transition-all duration-200',
            isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
          )}
        >
          Agenta
        </span>
      </div>

      <nav className="flex flex-col gap-2 p-4 flex-grow">
        {/* Custom Agent Builder is now a special button */}
        <button
          onClick={onNewAgentClick}
          className="flex items-center gap-4 rounded-lg p-3 text-white bg-purple-600 hover:bg-purple-500 transition-colors mb-4"
        >
          <PlusCircle className="h-6 w-6 flex-shrink-0" />
          <span
            className={cn(
              'text-sm font-medium overflow-hidden whitespace-nowrap',
              'transition-all duration-200',
              isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
            )}
          >
            New Custom Agent
          </span>
        </button>

        {/* Other features */}
        {features.map((feature, index) => (
          <a
            key={index}
            href="#"
            className="flex items-center gap-4 rounded-lg p-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <feature.icon className="h-6 w-6 flex-shrink-0" />
            <span
              className={cn(
                'text-sm font-medium overflow-hidden whitespace-nowrap',
                'transition-all duration-200',
                isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
              )}
            >
              {feature.name}
            </span>
          </a>
        ))}
      </nav>
      {/* The user profile section at the bottom has been REMOVED */}
    </aside>
  );
};


export default Sidebar;
