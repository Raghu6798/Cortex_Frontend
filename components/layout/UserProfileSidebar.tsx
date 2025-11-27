'use client';

import React, { useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import { 
  LogOut, 
  Settings, 
  CreditCard, 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  Moon, 
  Sun, 
  Edit3, 
  Download, 
  Trash2,
  Star,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Types for better TypeScript support
interface UserStats {
  totalProjects: number;
  completedTasks: number;
  achievements: number;
  joinDate: string;
}

interface UserProfileSidebarProps {
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const UserProfileSidebar = ({ 
  isExpanded, 
  onMouseEnter, 
  onMouseLeave,
  darkMode = true,
  onToggleDarkMode 
}: UserProfileSidebarProps) => {
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState<string>('profile');
 
  const userStats: UserStats = {
    totalProjects: 24,
    completedTasks: 156,
    achievements: 8,
    joinDate: '2023-06-15'
  };

  // Credit usage calculation
  const creditUsed = 1450230;
  const creditTotal = 2000000;
  const creditPercentage = Math.round((creditUsed / creditTotal) * 100);

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications', badge: 3 },
    { id: 'billing', label: 'Billing', icon: CreditCard, href: '/billing' },
    { id: 'security', label: 'Security', icon: Shield, href: '/security' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/help' },
    // ADDED: A dedicated logout item in the main menu
    { id: 'logout', label: 'Sign Out', icon: LogOut, action: 'logout' }
  ];

  const quickActions = [
    { id: 'edit-profile', label: 'Edit Profile', icon: Edit3, action: () => console.log('Edit profile') },
    { id: 'download-data', label: 'Download Data', icon: Download, action: () => console.log('Download data') },
    { id: 'delete-account', label: 'Delete Account', icon: Trash2, action: () => console.log('Delete account'), dangerous: true }
  ];

  return (
    <aside
    id={TOUR_STEP_IDS.USER_PROFILE}
      className={cn(
        'fixed top-0 right-0 h-full border-l border-white/10 p-4 hidden xl:flex flex-col z-30 bg-black/50 backdrop-blur-xl',
        'transition-all duration-300 ease-in-out overflow-y-auto scrollbar-hide',
        isExpanded ? 'w-80' : 'w-20'
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* User Profile Header */}
      <div className="flex flex-col items-center text-center border-b border-white/10 pb-4 mb-4">
        <div className="relative">
          <Image
  src={user?.imageUrl || '/default-avatar.png'}
  alt={user?.fullName || 'User Avatar'}
  width={isExpanded ? 96 : 64}   // 24*4 = 96px, 16*4 = 64px
  height={isExpanded ? 96 : 64}
  className="rounded-full border-2 border-purple-500 shadow-lg object-cover transition-all duration-300"
/>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
        </div>
        
        <div className={cn('overflow-hidden transition-all duration-200 ease-in-out', isExpanded ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0')}>
          <h2 className="text-xl font-bold text-white truncate">{user?.fullName || 'Guest User'}</h2>
          <p className="text-sm text-white/60 truncate">{user?.primaryEmailAddress?.emailAddress || 'No email'}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs text-white/70">Pro Member</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={cn('grid gap-2 mb-4 transition-all duration-200 ease-in-out', isExpanded ? 'grid-cols-2 opacity-100' : 'grid-cols-1 opacity-0 h-0')}>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{userStats.totalProjects}</div>
          <div className="text-xs text-white/60">Projects</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{userStats.completedTasks}</div>
          <div className="text-xs text-white/60">Tasks</div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="mb-6">
        <div className={cn("flex items-center gap-3 mb-3", !isExpanded && "justify-center")}>
          <div className="relative"><CreditCard className="h-5 w-5 text-white/70 flex-shrink-0" />{creditPercentage > 90 && (<Zap className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />)}</div>
          <h3 className={cn("text-xs font-semibold uppercase text-white/70 tracking-wider transition-all duration-200 overflow-hidden", isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0')}>Credits</h3>
        </div>
        <div className={cn('overflow-hidden transition-all duration-200 ease-in-out', isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0')}>
          <div className="flex items-center justify-between mb-2"><p className="text-lg font-semibold text-white">{creditUsed.toLocaleString()}</p><p className="text-sm text-white/60">{creditTotal.toLocaleString()}</p></div>
          <div className="w-full bg-black/30 rounded-full h-2.5 mb-2"><div className={cn("h-2.5 rounded-full transition-all duration-500", creditPercentage > 90 ? "bg-red-500" : creditPercentage > 70 ? "bg-yellow-500" : "bg-purple-600")} style={{ width: `${creditPercentage}%` }} /></div>
          <div className="flex items-center justify-between"><p className="text-xs text-white/50">{creditPercentage}% used</p><button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Upgrade</button></div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-grow mb-4 border-t border-white/10 pt-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            
            // --- LOGIC FOR LOGOUT BUTTON ---
            if (item.action === 'logout') {
              return (
                <SignOutButton key={item.id}>
                  <button className={cn("flex w-full items-center gap-3 rounded-lg p-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200", !isExpanded && "justify-center")}>
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className={cn("text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap", isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0')}>{item.label}</span>
                  </button>
                </SignOutButton>
              );
            }

            return (
              <a key={item.id} href={item.href} className={cn("flex items-center gap-3 rounded-lg p-3 text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200", !isExpanded && "justify-center", activeSection === item.id && "bg-white/10 text-white border border-white/20")} onClick={() => setActiveSection(item.id)}>
                <div className="relative"><IconComponent className="h-5 w-5 flex-shrink-0" />{item.badge && (<span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{item.badge}</span>)}</div>
                <span className={cn("text-sm font-medium transition-all duration-200 overflow-hidden whitespace-nowrap", isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0')}>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Quick Actions, Dark Mode, and Footer */}
      {/* ... (The rest of your component code remains exactly the same) ... */}
      <div className={cn('border-t border-white/10 pt-4 mb-4 transition-all duration-200', isExpanded ? 'opacity-100' : 'opacity-0 h-0')}>
        <h4 className="text-xs font-semibold uppercase text-white/70 tracking-wider mb-3">Quick Actions</h4>
        <div className="space-y-1">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (<button key={action.id} onClick={action.action} className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-sm transition-colors text-left", action.dangerous ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" : "text-white/70 hover:bg-white/5 hover:text-white")}>
                <IconComponent className="h-4 w-4 flex-shrink-0" /><span>{action.label}</span>
              </button>);
          })}
        </div>
      </div>

      {onToggleDarkMode && (<div className="mb-4">
          <button onClick={onToggleDarkMode} className={cn("flex w-full items-center gap-3 rounded-lg p-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors", !isExpanded && "justify-center")}>
            {darkMode ? (<Sun className="h-5 w-5 flex-shrink-0" />) : (<Moon className="h-5 w-5 flex-shrink-0" />)}
            <span className={cn("text-sm font-medium transition-all duration-200 overflow-hidden", isExpanded ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0')}>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>)}

      {/* REMOVED the duplicate SignOutButton from the absolute bottom, as it's now in the menu */}
      
      <div className={cn('mt-auto pt-4 border-t border-white/10 text-center transition-all duration-200', isExpanded ? 'opacity-100' : 'opacity-0 h-0')}>
        <p className="text-xs text-white/40">Member since {new Date(userStats.joinDate).toLocaleDateString()}</p>
        <p className="text-xs text-white/40 mt-1">Version 2.1.0</p>
      </div>
    </aside>
  );
};

export default UserProfileSidebar;

