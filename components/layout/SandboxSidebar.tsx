'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import {
  GrCodeSandbox,
} from "react-icons/gr";
import {
  FileText,
  Webhook,
  Settings,
  Key,
  TrendingUp,
  Wallet,
  Receipt,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SandboxSidebarProps {
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SandboxSidebar = ({ isExpanded, onMouseEnter, onMouseLeave }: SandboxSidebarProps) => {
  const { user } = useUser();

  const navigationItems = [
    { name: 'Sandboxes', icon: GrCodeSandbox, href: '/dashboard/sandboxes', active: true },
    { name: 'Templates', icon: FileText, href: '/dashboard/sandboxes/templates', active: false },
  ];

  const integrationItems = [
    { name: 'Webhooks', icon: Webhook, href: '/dashboard/sandboxes/webhooks' },
  ];

  const teamItems = [
    { name: 'General', icon: Settings, href: '/dashboard/sandboxes/team/general' },
    { name: 'API Keys', icon: Key, href: '/dashboard/sandboxes/team/api-keys' },
  ];

  const billingItems = [
    { name: 'Usage', icon: TrendingUp, href: '/dashboard/sandboxes/billing/usage' },
    { name: 'Budget', icon: Wallet, href: '/dashboard/sandboxes/billing/budget' },
    { name: 'Billing', icon: Receipt, href: '/dashboard/sandboxes/billing' },
  ];

  const renderNavItem = (item: { name: string; icon: React.ComponentType<{ className?: string }> | typeof GrCodeSandbox; href: string; active?: boolean }) => {
    const IconComponent = item.icon;
    const isActive = item.active;
    
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg p-3 transition-colors',
          isActive
            ? 'bg-orange-500/10 text-orange-400'
            : 'text-white/70 hover:bg-white/5 hover:text-white'
        )}
      >
        <IconComponent className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-orange-400')} />
        <span
          className={cn(
            'text-sm font-medium overflow-hidden whitespace-nowrap',
            'transition-all duration-200',
            isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
          )}
        >
          {item.name}
        </span>
        {isActive && isExpanded && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-r" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'h-full border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-xl',
        'transition-all duration-300 ease-in-out',
        isExpanded ? 'w-64' : 'w-20'
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-20 border-b border-white/10 flex-shrink-0 px-4">
        <Link href="/dashboard/sandboxes">
          <Image
            src="/download.png"
            alt="Cortex Logo"
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
          E2B
        </span>
      </div>

      {/* User/Team Info */}
      <div className={cn(
        'px-4 py-3 border-b border-white/10 flex items-center gap-3',
        'transition-all duration-200'
      )}>
        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">
            {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || 'C'}
          </span>
        </div>
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
          )}
        >
          <p className="text-sm font-medium text-white truncate">
            {user?.emailAddresses?.[0]?.emailAddress || 'user@example.com'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4 flex-grow overflow-y-auto scrollbar-hide">
        {navigationItems.map((item) => (
          <div key={item.name} className="relative">
            {renderNavItem(item)}
          </div>
        ))}

        {/* Integration Section */}
        <div className={cn('mt-6 mb-2 transition-all duration-200', !isExpanded && 'opacity-0')}>
          {isExpanded && (
            <h3 className="text-xs font-semibold uppercase text-white/50 tracking-wider mb-2 px-3">
              Integration
            </h3>
          )}
          {integrationItems.map((item) => (
            <div key={item.name} className="relative">
              {renderNavItem(item)}
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className={cn('mt-4 mb-2 transition-all duration-200', !isExpanded && 'opacity-0')}>
          {isExpanded && (
            <h3 className="text-xs font-semibold uppercase text-white/50 tracking-wider mb-2 px-3">
              Team
            </h3>
          )}
          {teamItems.map((item) => (
            <div key={item.name} className="relative">
              {renderNavItem(item)}
            </div>
          ))}
        </div>

        {/* Billing Section */}
        <div className={cn('mt-4 mb-2 transition-all duration-200', !isExpanded && 'opacity-0')}>
          {isExpanded && (
            <h3 className="text-xs font-semibold uppercase text-white/50 tracking-wider mb-2 px-3">
              Billing
            </h3>
          )}
          {billingItems.map((item) => (
            <div key={item.name} className="relative">
              {renderNavItem(item)}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default SandboxSidebar;

