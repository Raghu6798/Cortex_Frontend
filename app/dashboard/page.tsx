'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
import { useUser } from '@clerk/nextjs';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Users, LayoutDashboard } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import UserProfileSidebar from '@/components/layout/UserProfileSidebar';
import MultiModalChatUI from '@/components/ui/agents_ui/MultiModalChatUI';
import AgentBuilder, { AgentState, ToolConfig } from '@/components/ui/agents_ui/AgentBuild';
import AgentList from '@/components/ui/agents_ui/AgentList';
import AgentEditor from '@/components/ui/agents_ui/AgentEditor';
import { NumberTicker } from '@/components/ui/general/CountingNumbers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/shadcn/skeleton'; // Import the Skeleton component

// --- MOCK DATA ---
const latencyData = [{ time: "12:00", latency: 85 }, { time: "12:01", latency: 95 }, { time: "12:02", latency: 140 }, { time: "12:03", latency: 110 }, { time: "12:04", latency: 180 }, { time: "12:05", latency: 130 }, { time: "12:06", latency: 125 }];
const throughputData = [{ hour: '09:00', requests: 1200 }, { hour: '10:00', requests: 1550 }, { hour: '11:00', requests: 1800 }, { hour: '12:00', requests: 1400 }, { hour: '13:00', requests: 950 }, { hour: '14:00', requests: 1600 }, { hour: '15:00', requests: 1750 }];

// --- Reusable Components ---
const StatCard = ({ title, value, suffix, prefix, icon: Icon }: { title: string; value: number; suffix?: string; prefix?: string; icon?: React.ElementType; }) => (<div className="rounded-xl border border-white/15 bg-black/30 p-6"><div className="flex items-center gap-2">{Icon && <Icon className="h-4 w-4 text-white/70" />}<h3 className="text-sm font-medium text-white/70">{title}</h3></div><div className="mt-2"><NumberTicker value={value} suffix={suffix} prefix={prefix} className="text-4xl font-bold tracking-tighter" /></div></div>);
const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (<div className="rounded-xl border border-white/15 bg-black/30 p-6"><h3 className="text-lg font-semibold mb-4">{title}</h3>{children}</div>);

// --- Dashboard View Component ---
const DashboardMetricsView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Tokens Used" value={2478931} />
        <StatCard title="Avg. Response Time" value={197} suffix="ms" />
        <StatCard title="Memory Persisted" value={21.4} suffix="GB" />
        <StatCard title="Active Agents" value={42} icon={Users} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ChartCard title="P95 Latency (Last 7 Mins)"><ResponsiveContainer width="100%" height={300}><LineChart data={latencyData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" /><XAxis dataKey="time" stroke="#888" fontSize={12} /><YAxis stroke="#888" fontSize={12} unit="ms" /><Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '0.5rem' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }} /><Legend iconType="circle" /><Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#a855f7" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Throughput (Requests/Hour)"><ResponsiveContainer width="100%" height={300}><BarChart data={throughputData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" /><XAxis dataKey="hour" stroke="#888" fontSize={12} /><YAxis stroke="#888" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '0.5rem' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }} /><Legend iconType="square" /><Bar dataKey="requests" name="Requests" fill="#a855f7" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
      </div>
    </>
);

// --- SKELETON LOADER FOR THE DASHBOARD VIEW ---
const DashboardMetricsViewSkeleton = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/15 bg-black/30 p-6 space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="rounded-xl border border-white/15 bg-black/30 p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <Skeleton className="h-[250px] w-full" />
                </div>
            ))}
        </div>
    </>
);


// --- MAIN PAGE COMPONENT ---
export default function DashboardPage() {
  const { user } = useUser();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isUserSidebarExpanded, setIsUserSidebarExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'builder' | 'chat' | 'agents' | 'editor'>('dashboard');
  const [isLoading, setIsLoading] = useState(true); // State to control the skeleton
  const [initialAgentConfig, setInitialAgentConfig] = useState<AgentState | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<{
    id: string;
    name: string;
    description: string;
    architecture: string;
    framework: string;
    settings: Record<string, unknown>;
    tools: Record<string, unknown>[];
  } | null>(null);

  // Simulate data fetching for the dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Show skeleton for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Clear the initial config when we navigate away from the chat view
  useEffect(() => {
    if (activeView !== 'chat') {
      setInitialAgentConfig(null);
    }
  }, [activeView]);


  const handleAgentCreated = (config: AgentState) => {
    console.log("A new agent was created with this configuration:", config);
    setInitialAgentConfig(config); // Store the config
    setActiveView('chat'); // Switch to the chat view
  };

  const handleAgentSelect = (agent: { id: string; architecture: string; framework: string; settings: Record<string, unknown>; tools: Record<string, unknown>[] }) => {
    // Convert the agent from the API to AgentState format
    const agentState: AgentState = {
      architecture: agent.architecture as 'mono' | 'multi',
      framework: agent.framework,
      settings: agent.settings,
      tools: (agent.tools || []) as unknown as ToolConfig[] // Type assertion for now
    };
    
    setInitialAgentConfig(agentState);
    setActiveView('chat');
  };

  const handleAgentEdit = (agent: { id: string; name: string; description: string; architecture: string; framework: string; settings: Record<string, unknown>; tools: Record<string, unknown>[] }) => {
    setAgentToEdit(agent);
    setActiveView('editor');
  };

  const handleAgentSaved = (updatedAgent: unknown) => {
    console.log('Agent updated:', updatedAgent);
    setAgentToEdit(null);
    setActiveView('agents');
  };

  const handleCancelEdit = () => {
    setAgentToEdit(null);
    setActiveView('agents');
  };

  const getHeaderText = () => {
    switch (activeView) {
      case 'builder': return 'Create a New Custom Agent';
      case 'chat': return 'Custom Agent Chat';
      case 'agents': return 'Your Agents';
      case 'editor': return 'Edit Agent';
      case 'dashboard':
      default:
        return `Welcome Back, ${user?.firstName || 'Developer'}!`;
    }
  };

  const getHeaderSubtitle = () => {
    switch (activeView) {
      case 'builder': return 'Follow the steps to configure your new agent.';
      case 'chat': return 'Interact with your configured and saved agents.';
      case 'agents': return 'Manage and interact with your configured AI agents.';
      case 'editor': return 'Update your agent configuration.';
      case 'dashboard':
      default:
        return "Here's a live overview of your agent operations.";
    }
  };

  const renderContent = () => {
    if (activeView === 'builder') return <AgentBuilder onAgentCreated={handleAgentCreated} />;
    if (activeView === 'chat') return <MultiModalChatUI initialAgentConfig={initialAgentConfig} />;
    if (activeView === 'agents') return <AgentList onAgentSelect={handleAgentSelect} onAgentEdit={handleAgentEdit} onCreateNew={() => setActiveView('builder')} showHeader={false} />;
    if (activeView === 'editor' && agentToEdit) return <AgentEditor agent={agentToEdit} onSave={handleAgentSaved} onCancel={handleCancelEdit} />;
    
    // For dashboard, show skeleton while loading
    if (isLoading) return <DashboardMetricsViewSkeleton />;
    return <DashboardMetricsView />;
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        onNewAgentClick={() => setActiveView('builder')}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className={cn(
        'flex-1 p-6 md:p-8 transition-all duration-300 ease-in-out',
        isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20',
        isUserSidebarExpanded ? 'xl:mr-72' : 'xl:mr-24'
      )}>
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{getHeaderText()}</h2>
            <p className="text-white/60 mt-1">{getHeaderSubtitle()}</p>
          </div>
           {activeView !== 'dashboard' && (
             <button
               onClick={() => setActiveView('dashboard')}
               className="flex items-center gap-2 rounded-lg py-2 px-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
             >
               <LayoutDashboard size={18} />
               <span className="text-sm font-medium">Dashboard</span>
             </button>
           )}
        </header>

        {renderContent()}

      </main>

      <UserProfileSidebar
        isExpanded={isUserSidebarExpanded}
        onMouseEnter={() => setIsUserSidebarExpanded(true)}
        onMouseLeave={() => setIsUserSidebarExpanded(false)}
      />
    </div>
  );
}