// components/layout/Sidebar.tsx
'use client';

import React from 'react';
import {
  PlusCircle,
  LayoutDashboard,
  Bot,
  Shield,
  Workflow,
  Mic,
  Plug,
  Search,
  Wrench,
  FolderOpen,
} from 'lucide-react';
import { GrCodeSandbox } from "react-icons/gr";
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SidebarProps {
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNewAgentClick: () => void;
  activeView?: 'dashboard' | 'agents' | 'builder' | 'chat' | 'voice-chat' | 'secrets' | 'connectors' | 'ocr' | 'sandbox' | 'rag' | 'workflow';
}

const Sidebar = ({ isExpanded, onMouseEnter, onMouseLeave, onNewAgentClick, activeView }: SidebarProps) => {
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as const, id: TOUR_STEP_IDS.SIDEBAR_DASHBOARD },
    { name: 'Your Agents', icon: Bot, view: 'agents' as const, id: TOUR_STEP_IDS.SIDEBAR_AGENTS },
    { name: 'Voice Chat', icon: Mic, view: 'voice-chat' as const, id: TOUR_STEP_IDS.SIDEBAR_VOICE_CHAT },
    { name: 'Connectors', icon: Plug, view: 'connectors' as const, id: TOUR_STEP_IDS.SIDEBAR_CONNECTORS },
    { name: 'Secrets', icon: Shield, view: 'secrets' as const, id: TOUR_STEP_IDS.SIDEBAR_SECRETS },
    { name: 'OCR Parser', icon: FolderOpen, view: 'ocr' as const, id: TOUR_STEP_IDS.SIDEBAR_OCR },
    { name: 'RAG', icon: Search, view: 'rag' as const, id: TOUR_STEP_IDS.SIDEBAR_RAG },
    { name: 'Sandboxes', icon: GrCodeSandbox, view: 'sandbox' as const, id: TOUR_STEP_IDS.SIDEBAR_SANDBOX }
  ];

  const features: Array<{ name: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | 'codesandbox'; id: string }> = [
    { name: 'Pre-built Tools', icon: Wrench, id: TOUR_STEP_IDS.SIDEBAR_TOOLS }
  ];

  return (
    <aside
    id={TOUR_STEP_IDS.SIDEBAR} 
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
          Cortex 
        </span>
      </div>

      <nav className="flex flex-col gap-2 p-4 flex-grow">
        {/* Navigation Items */}
        {navigationItems.map((item) => {
          const getHref = (view: string) => {
            switch (view) {
              case 'dashboard': return '/dashboard';
              case 'agents': return '/dashboard?view=agents';
              case 'voice-chat': return '/dashboard?view=voice-chat';
              case 'connectors': return '/dashboard?view=connectors';
              case 'secrets': return '/dashboard?view=secrets';
              case 'ocr': return '/dashboard?view=ocr';
              case 'sandbox': return '/dashboard/sandboxes';
              case 'rag': return '/dashboard?view=rag';
              case 'workflow': return '/dashboard?view=workflow';
              default: return '/dashboard';
            }
          };

          return (
            <Link key={item.name} href={getHref(item.view)}>
              <button
                id={item.id}
                className={cn(
                  'flex items-center gap-4 rounded-lg p-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors w-full',
                  activeView === item.view && 'bg-white/10 text-white'
                )}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                <span
                  className={cn(
                    'text-sm font-medium overflow-hidden whitespace-nowrap',
                    'transition-all duration-200',
                    isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
                  )}
                >
                  {item.name}
                </span>
              </button>
            </Link>
          );
        })}

        {/* Custom Agent Builder is now a special button */}
        <button
          id={TOUR_STEP_IDS.CREATE_AGENT}
          onClick={onNewAgentClick}
          className="flex items-center gap-4 rounded-lg p-3 text-white bg-purple-600 hover:bg-purple-500 transition-colors mb-2"
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

        {/* Multi Agent Workflow Builder button */}
        <Link href="/dashboard?view=workflow">
          <button 
          id={TOUR_STEP_IDS.SIDEBAR_MULTI_AGENT}
          className={cn(
            'flex items-center gap-4 rounded-lg p-3 text-white bg-blue-600 hover:bg-blue-500 transition-colors mb-4 w-full',
            activeView === 'workflow' && 'bg-blue-700'
          )}>
            <Workflow className="h-6 w-6 flex-shrink-0" />
            <span
              className={cn(
                'text-sm font-medium overflow-hidden whitespace-nowrap',
                'transition-all duration-200',
                isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
              )}
            >
              Multi Agent
            </span>
          </button>
        </Link>

        {/* Other features */}
        {features.map((feature, index) => (
          <a
            key={index}
            href="#"
            id={feature.id}
            className="flex items-center gap-4 rounded-lg p-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            {feature.icon === 'codesandbox' ? (
              <Image
                src="/codesandbox.svg"
                alt="Code Sandbox"
                width={24}
                height={24}
                className="h-6 w-6 flex-shrink-0"
              />
            ) : (
              <feature.icon className="h-6 w-6 flex-shrink-0" />
            )}
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
