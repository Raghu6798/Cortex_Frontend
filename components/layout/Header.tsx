'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ChevronDown } from 'lucide-react'; // For the dropdown icons
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Products',
    children: [
      { label: 'Agent Builder', description: 'Create and configure agents.', href: '/products/builder' },
      { label: 'Observability', description: 'Monitor performance.', href: '/products/observability' },
      { label: 'Memory Persistence', description: 'Manage agent state.', href: '/products/memory' },
    ],
  },
  { label: 'Playground', href: '/playground' },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Resources',
    children: [
      { label: 'Customer Stories', description: 'See who is building with us.', href: '/resources/stories' },
      { label: 'GitHub', description: 'View our open-source code.', href: 'https://github.com/agentadevs/agenta', external: true },
      { label: 'Community', description: 'Join our developer community.', href: '/resources/community' },
    ],
  },
];

type HeaderProps = {
  isCompact: boolean;
};

export default function Header({ isCompact }: HeaderProps) {
  // --- STATE FOR DROPDOWN ---
  // Store the label of the currently open dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // --- EFFECT FOR CLICK-OUTSIDE-TO-CLOSE ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-3xl border border-white/20 bg-black/30 backdrop-blur-md transition-all duration-300',
          isCompact ? 'px-5 py-2' : 'px-6 py-3'
        )}
      >
        {/* Logo and App Name */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/download.png"
            alt="Agenta logo"
            width={isCompact ? 32 : 40}
            height={isCompact ? 32 : 40}
            className="rounded-sm"
            priority
          />
          <div
            className={cn(
              'font-semibold tracking-widest transition-all duration-300',
              isCompact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
            )}
          >
            Cortex
          </div>
        </Link>

        {/* --- 2. DYNAMIC NAVIGATION SECTION --- */}
        <nav ref={navRef} className="hidden items-center lg:flex">
          {navItems.map((item) => (
            <div key={item.label} className="relative">
              {item.children ? (
                // --- Dropdown Trigger ---
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  className={cn(
                    'flex items-center gap-1 rounded-lg px-4 py-2 text-white/80 transition-colors hover:text-white',
                    isCompact ? 'text-sm' : 'text-base',
                    openDropdown === item.label ? 'bg-white/10 text-white' : ''
                  )}
                >
                  {item.label}
                  <ChevronDown
                    size={16}
                    className={cn(
                      'transition-transform duration-200',
                      openDropdown === item.label ? 'rotate-180' : ''
                    )}
                  />
                </button>
              ) : (
                // --- Simple Link ---
                <Link
                  href={item.href || '#'}
                  className={cn(
                    'rounded-lg px-4 py-2 text-white/80 transition-colors hover:text-white',
                    isCompact ? 'text-sm' : 'text-base'
                  )}
                >
                  {item.label}
                </Link>
              )}

              {/* --- Dropdown Panel --- */}
              {item.children && openDropdown === item.label && (
                <div
                  className={cn(
                    'absolute left-1/2 mt-2 w-64 -translate-x-1/2 origin-top rounded-xl border border-white/20 bg-black/60 p-2 backdrop-blur-lg shadow-xl'
                  )}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href || '#'}
                      target={child.external ? '_blank' : undefined}
                      rel={child.external ? 'noopener noreferrer' : undefined}
                      onClick={() => setOpenDropdown(null)}
                      className="block rounded-md p-3 text-left transition-colors hover:bg-white/10"
                    >
                      <p className="font-semibold text-white">{child.label}</p>
                      <p className="text-sm text-white/70">{child.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* --- 3. AUTHENTICATION SECTION --- */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link
              href="/sign-in"
              className={cn(
                'hidden rounded-lg px-4 py-2 text-white/80 transition-colors hover:text-white sm:block',
                isCompact ? 'text-sm' : 'text-base'
              )}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className={cn(
                'rounded-lg bg-white font-medium text-black shadow-lg transition-colors hover:bg-white/90',
                isCompact ? 'px-4 py-2 text-sm' : 'px-5 py-2.5 text-base'
              )}
            >
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: isCompact ? 'h-8 w-8' : 'h-10 w-10',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}