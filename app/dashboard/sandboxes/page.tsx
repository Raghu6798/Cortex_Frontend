'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import UserProfileSidebar from '@/components/layout/UserProfileSidebar';
import { cn } from '@/lib/utils';
import { GrCodeSandbox } from "react-icons/gr";
import { 
  Plus, 
  Clock, 
  Trash2, 
  ChevronRight, 
  Filter, 
  LineChart,
  ListCollapse,
  Info,
  X,
  Copy,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog"
import { Input } from "@/components/ui/shadcn/Input"
import { Label } from "@/components/ui/shadcn/label"
import { Switch } from "@/components/ui/shadcn/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs" 

// --- MOCK DATA BASED ON DOCUMENTATION ---
type SandboxState = 'running' | 'paused';

type SupportedLanguage = 'overview' | 'python' | 'javascript' | 'r' | 'java' | 'bash';

const supportedLanguages: Array<{ id: SupportedLanguage; name: string }> = [
  { id: 'overview', name: 'Overview' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript and TypeScript' },
  { id: 'r', name: 'R' },
  { id: 'java', name: 'Java' },
  { id: 'bash', name: 'Bash' },
];
type Sandbox = {
  sandboxId: string;
  templateId: string;
  state: SandboxState;
  metadata: { name?: string; [key: string]: string | undefined };
  startedAt: string;
  endAt: string;
};

const mockSandboxes: Sandbox[] = [
  {
    sandboxId: "iiny0783cype8gmoawzmx-ce30bc46",
    templateId: "rki5dems9wqfm4r03t7g",
    state: 'running',
    metadata: { name: "Web Scraper Agent Sandbox", userId: "user-123" },
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
  },
  {
    sandboxId: "ig6f1yt6idvxkxl562scj-419ff533",
    templateId: "u7nqkmpn3jjf1tvftlsu",
    state: 'running',
    metadata: { name: "Data Analysis Task", userId: "user-456" },
    startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
  },
  {
    sandboxId: "ixjj3iankaishgcge4jwn-b0b684e9",
    templateId: "3e4rngfa34txe0gxc1zf",
    state: 'paused',
    metadata: { name: "Archived RAG Task", userId: "user-123" },
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
];

const mockEvents = [
    { id: "f5911677-cb60-498f-afed-f68143b3cc59", type: "sandbox.lifecycle.killed", timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString() },
    { id: "30b09e11-9ba2-42db-9cf6-d21f0f43a234", type: "sandbox.lifecycle.updated", eventData: { set_timeout: new Date(Date.now() + 50 * 60 * 1000).toISOString() }, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: "0568572b-a2ac-4e5f-85fa-fae90905f556", type: "sandbox.lifecycle.created", eventData: null, timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
];

// --- UI SUB-COMPONENTS ---

const SandboxStateBadge = ({ state }: { state: SandboxState }) => {
  const isRunning = state === 'running';
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500')} />
      <span className="text-sm font-medium text-white/90 capitalize">{state}</span>
    </div>
  );
};

const TimeRemaining = ({ endAt, state }: { endAt: string, state: SandboxState }) => {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (state !== 'running') {
      setRemaining('Expired');
      return;
    }
    const interval = setInterval(() => {
      const diff = new Date(endAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setRemaining('Expired');
        clearInterval(interval);
        return;
      }
      const minutes = Math.floor((diff / 1000) / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setRemaining(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [endAt, state]);

  return (
    <div className="flex items-center gap-1.5 text-sm text-white/70">
      <Clock className="w-4 h-4" />
      <span>{remaining}</span>
    </div>
  );
};

const SandboxCard = ({ sandbox, onSelect }: { sandbox: Sandbox, onSelect: () => void }) => (
  <motion.div
    layoutId={`sandbox-card-${sandbox.sandboxId}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    onClick={onSelect}
    className="rounded-xl border border-white/15 bg-black/30 p-5 hover:border-purple-500/50 hover:bg-black/40 transition-all duration-200 cursor-pointer group"
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <GrCodeSandbox className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
            {sandbox.metadata.name || 'Unnamed Sandbox'}
          </h3>
          <p className="text-xs text-white/50 font-mono truncate max-w-[200px]">{sandbox.sandboxId}</p>
        </div>
      </div>
      <SandboxStateBadge state={sandbox.state} />
    </div>
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
      <TimeRemaining endAt={sandbox.endAt} state={sandbox.state} />
      <Button size="sm" className="bg-purple-600 hover:bg-purple-500">
        Details <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </motion.div>
);

const SandboxDetailView = ({ sandbox, onClose }: { sandbox: Sandbox, onClose: () => void }) => {
    return (
        <motion.div
            layoutId={`sandbox-card-${sandbox.sandboxId}`}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "circOut" }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-4xl h-[90vh] bg-black/80 border border-white/15 rounded-2xl shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                            <GrCodeSandbox className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl text-white">
                                {sandbox.metadata.name || 'Unnamed Sandbox'}
                            </h2>
                            <p className="text-xs text-white/50 font-mono">{sandbox.sandboxId}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hover:text-white hover:bg-white/10"><X className="w-5 h-5"/></Button>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-black/30">
                            <TabsTrigger value="info"><Info className="w-4 h-4 mr-2" />Info & Actions</TabsTrigger>
                            <TabsTrigger value="metrics"><LineChart className="w-4 h-4 mr-2" />Metrics</TabsTrigger>
                            <TabsTrigger value="events"><ListCollapse className="w-4 h-4 mr-2" />Event Log</TabsTrigger>
                        </TabsList>
                        <TabsContent value="info" className="mt-4 space-y-4">
                            <Card className="bg-black/20 border-white/10">
                                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <DetailRow label="State" value={<SandboxStateBadge state={sandbox.state} />} />
                                    <DetailRow label="Template ID" value={<span className="font-mono">{sandbox.templateId}</span>} />
                                    <DetailRow label="Started At" value={new Date(sandbox.startedAt).toLocaleString()} />
                                    <DetailRow label="Ends At" value={new Date(sandbox.endAt).toLocaleString()} />
                                    <DetailRow label="Time Remaining" value={<TimeRemaining endAt={sandbox.endAt} state={sandbox.state} />} />
                                </CardContent>
                            </Card>
                             <Card className="bg-black/20 border-white/10">
                                <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Input type="number" placeholder="New timeout (seconds)" className="max-w-xs bg-black/50 border-white/20"/>
                                        <Button className="bg-purple-600 hover:bg-purple-500">Set Timeout</Button>
                                    </div>
                                    <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2"/>Shutdown Sandbox</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="metrics" className="mt-4">
                            <Card className="bg-black/20 border-white/10">
                                <CardHeader><CardTitle>Real-time Usage</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="h-64 bg-black/30 flex items-center justify-center rounded-md text-white/50">Metrics Chart Placeholder</div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="events" className="mt-4">
                            <Card className="bg-black/20 border-white/10">
                                <CardHeader><CardTitle>Lifecycle Events</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto scrollbar-hide">
                                        {mockEvents.map(event => (
                                            <div key={event.id} className="p-2 bg-black/40 rounded flex justify-between items-start">
                                                <div>
                                                    <span className="text-purple-400">{new Date(event.timestamp).toLocaleTimeString()}: </span>
                                                    <span className="text-white/80">{event.type}</span>
                                                    {event.eventData && <pre className="text-white/50 text-[10px] mt-1 whitespace-pre-wrap">{JSON.stringify(event.eventData)}</pre>}
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(JSON.stringify(event))}><Copy className="w-3 h-3 text-white/40"/></Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </motion.div>
    );
};

const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center">
        <strong className="text-white/60">{label}:</strong>
        <div>{value}</div>
    </div>
);

const CreateSandboxDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px] bg-black/80 border-white/15 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Sandbox</DialogTitle>
                    <DialogDescription>Configure and launch a new isolated environment for your coding agent.</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="basic" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3 bg-black/30">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="env">Environment</TabsTrigger>
                        <TabsTrigger value="network">Network</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic" className="pt-4 space-y-4">
                        <Field label="Name (Metadata)" id="name" placeholder="My Web Scraper Sandbox" />
                        <Field label="Template ID" id="template" placeholder="base" />
                        <Field label="Timeout (seconds)" id="timeout" type="number" defaultValue={300} />
                    </TabsContent>
                    <TabsContent value="env" className="pt-4">
                         <div className="space-y-2">
                             <Label>Global Environment Variables</Label>
                             <div className="p-4 border border-dashed border-white/20 rounded-md">
                                <div className="flex items-center justify-center h-24 bg-black/30 rounded-md text-white/50">Key-Value Inputs Coming Soon</div>
                                <Button variant="outline" size="sm" className="mt-2"><Plus className="w-4 h-4 mr-2"/> Add Variable</Button>
                             </div>
                         </div>
                    </TabsContent>
                    <TabsContent value="network" className="pt-4 space-y-4">
                        <SwitchField label="Allow Internet Access" id="internet" defaultChecked />
                        <SwitchField label="Restrict Public URLs" id="public-urls" />
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-500">Create Sandbox</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const Field = ({ label, id, ...props }: { label: string, id: string, [key: string]: unknown }) => (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} className="bg-black/50 border-white/20" {...props} />
    </div>
);

const SwitchField = ({ label, id, ...props }: { label: string, id: string, [key: string]: unknown }) => (
    <div className="flex items-center justify-between p-3 rounded-md border border-white/15 bg-black/40">
        <Label htmlFor={id}>{label}</Label>
        <Switch id={id} {...props} />
    </div>
);


// --- MAIN PAGE COMPONENT ---

// Language Selection Sidebar Component
const LanguageSidebar = ({ selectedLanguage, onLanguageSelect }: { selectedLanguage: SupportedLanguage; onLanguageSelect: (lang: SupportedLanguage) => void }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <aside className={cn(
            "w-64 border-r border-white/10 bg-black/30 flex flex-col transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
        )}>
            <div className="p-4 border-b border-white/10">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-white/80 hover:text-white transition-colors"
                >
                    <span className="text-sm font-semibold">Supported languages</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded ? "rotate-180" : "")} />
                </button>
            </div>
            <nav className="flex-1 p-2">
                {supportedLanguages.map((lang) => {
                    const isSelected = selectedLanguage === lang.id;
                    return (
                        <button
                            key={lang.id}
                            onClick={() => onLanguageSelect(lang.id)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-md mb-1 transition-colors relative",
                                isSelected
                                    ? "text-orange-400 bg-orange-500/10"
                                    : "text-white/70 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-r" />
                            )}
                            <span className="text-sm">{lang.name}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default function SandboxesPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isUserSidebarExpanded, setIsUserSidebarExpanded] = useState(false);
    const [sandboxes] = useState<Sandbox[]>(mockSandboxes);
    const [filter, setFilter] = useState<SandboxState | 'all'>('all');
    const [selectedSandbox, setSelectedSandbox] = useState<Sandbox | null>(null);
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('bash');

    const filteredSandboxes = useMemo(() => {
        if (filter === 'all') return sandboxes;
        return sandboxes.filter(s => s.state === filter);
    }, [sandboxes, filter]);

    return (
        <div className="flex min-h-screen bg-black text-white">
            <Sidebar
                isExpanded={isSidebarExpanded}
                onMouseEnter={() => setIsSidebarExpanded(true)}
                onMouseLeave={() => setIsSidebarExpanded(false)}
                onNewAgentClick={() => {}}
                activeView={'sandbox'}
            />

            <main className={cn(
                'flex-1 flex flex-col transition-all duration-300 ease-in-out',
                isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20',
                isUserSidebarExpanded ? 'xl:mr-72' : 'xl:mr-24'
            )}>
                <div className="flex flex-1 overflow-hidden">
                    {/* Language Selection Sidebar */}
                    <LanguageSidebar 
                        selectedLanguage={selectedLanguage} 
                        onLanguageSelect={setSelectedLanguage} 
                    />
                    
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
                        {/* Header */}
                        <header className="mb-8 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">Code Sandboxes</h2>
                                    <p className="text-white/60 mt-1">Manage isolated environments for your AI coding agents.</p>
                                </div>
                                <Button className="bg-purple-600 hover:bg-purple-500" onClick={() => setCreateDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Sandbox
                                </Button>
                            </div>
                        </header>

                        {/* Filters */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                {(['all', 'running', 'paused'] as const).map(f => (
                                    <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}
                                        className={cn(filter === f ? 'bg-white/10 border-white/20' : 'bg-black/30 border-white/15 hover:bg-white/5')}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </Button>
                                ))}
                            </div>
                            <Button variant="outline" className="bg-black/30 border-white/15 hover:bg-white/5">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter by Metadata
                            </Button>
                        </div>
                        
                        {/* Sandbox Grid */}
                        <AnimatePresence>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredSandboxes.map(sandbox => (
                                    <SandboxCard key={sandbox.sandboxId} sandbox={sandbox} onSelect={() => setSelectedSandbox(sandbox)} />
                                ))}
                            </div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Detail View */}
                <AnimatePresence>
                    {selectedSandbox && <SandboxDetailView sandbox={selectedSandbox} onClose={() => setSelectedSandbox(null)} />}
                </AnimatePresence>
                
                {/* Create Dialog */}
                <CreateSandboxDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />

            </main>

            <UserProfileSidebar
                isExpanded={isUserSidebarExpanded}
                onMouseEnter={() => setIsUserSidebarExpanded(true)}
                onMouseLeave={() => setIsUserSidebarExpanded(false)}
            />
        </div>
    );
}