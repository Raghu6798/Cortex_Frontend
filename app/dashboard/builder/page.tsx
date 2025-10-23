// app/dashboard/builder/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import UserProfileSidebar from '@/components/layout/UserProfileSidebar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// We will create this component in the next step
import WorkflowBuilder from '@/components/ui/agents_ui/WorkflowBuilder'; 

export default function BuilderPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(false);
  const [isUserSidebarExpanded, setIsUserSidebarExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading animation for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        onNewAgentClick={() => {}}
        activeView={'builder'}
        onViewChange={() => {}}
      />

      <main className={cn(
        'flex-1 flex flex-col p-6 md:p-8 transition-all duration-300 ease-in-out',
        isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20',
        isUserSidebarExpanded ? 'xl:mr-72' : 'xl:mr-24'
      )}>
        <header className="mb-8 flex-shrink-0">
          <h2 className="text-3xl font-bold tracking-tight">Multi-Agent Workflow Builder</h2>
          <p className="text-white/60 mt-1">Visually construct and connect your AI agents.</p>
        </header>
        
        {/* Loading Animation */}
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Loading Workflow Builder</h3>
                <p className="text-white/60">Preparing your multi-agent workspace...</p>
              </div>
            </div>
          </div>
        ) : (
          /* The Workflow Builder will take up the remaining space */
          <div className="flex-grow h-full w-full">
              <WorkflowBuilder />
          </div>
        )}
      </main>

      <UserProfileSidebar
        isExpanded={isUserSidebarExpanded}
        onMouseEnter={() => setIsUserSidebarExpanded(true)}
        onMouseLeave={() => setIsUserSidebarExpanded(false)}
      />
    </div>
  );
}