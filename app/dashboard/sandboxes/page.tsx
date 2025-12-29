'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Sidebar from '@/components/layout/Sidebar';
import SandboxSidebar from '@/components/layout/SandboxSidebar';
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
  RefreshCw,
  Activity,
  Loader2
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
import { toast } from "sonner";

// --- TYPES ---
type SandboxState = 'running' | 'paused' | 'killed';

type Sandbox = {
  id: string; // Internal DB UUID
  sandboxId: string; // E2B Cloud ID
  templateId: string;
  state: SandboxState;
  metadata: { name?: string; [key: string]: any };
  startedAt: string;
  endAt: string;
};

// --- UI SUB-COMPONENTS ---

const SandboxStateBadge = ({ state }: { state: SandboxState }) => {
  const isRunning = state === 'running';
  const isKilled = state === 'killed';
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'w-2 h-2 rounded-full', 
        isRunning ? 'bg-green-500 animate-pulse' : isKilled ? 'bg-red-500' : 'bg-yellow-500'
      )} />
      <span className="text-sm font-medium text-white/90 capitalize">{state}</span>
    </div>
  );
};

const TimeRemaining = ({ endAt, state }: { endAt: string, state: SandboxState }) => {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (state !== 'running') {
      setRemaining(state === 'killed' ? 'Terminated' : 'Paused');
      return;
    }
    const update = () => {
      const diff = new Date(endAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setRemaining('Expired');
        return;
      }
      const minutes = Math.floor((diff / 1000) / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setRemaining(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    };
    update();
    const interval = setInterval(update, 1000);
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
    layoutId={`sandbox-card-${sandbox.id}`}
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
            {sandbox.metadata?.name || 'Unnamed Sandbox'}
          </h3>
          <p className="text-xs text-white/50 font-mono truncate max-w-[180px]">{sandbox.sandboxId}</p>
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

const SandboxDetailView = ({ sandbox, onClose, onAction }: { sandbox: Sandbox, onClose: () => void, onAction: () => void }) => {
    const [isTerminating, setIsTerminating] = useState(false);
    const { getToken } = useAuth();

    const handleTerminate = async () => {
        if (!confirm("Are you sure you want to shut down this sandbox?")) return;
        setIsTerminating(true);
        try {
            const token = await getToken();
            const res = await fetch(`/api/v1/sandboxes/${sandbox.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Sandbox scheduled for termination");
                onAction();
                onClose();
            }
        } catch (e) {
            toast.error("Failed to kill sandbox");
        } finally {
            setIsTerminating(false);
        }
    };

    return (
        <motion.div
            layoutId={`sandbox-card-${sandbox.id}`}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="relative w-full max-w-4xl h-[85vh] bg-black/80 border border-white/15 rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <GrCodeSandbox className="h-6 w-6 text-purple-400" />
                        <h2 className="font-semibold text-xl text-white">{sandbox.metadata?.name || 'Sandbox Detail'}</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hover:text-white"><X /></Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <Tabs defaultValue="info">
                        <TabsList className="grid w-full grid-cols-2 bg-black/30">
                            <TabsTrigger value="info"><Info className="w-4 h-4 mr-2" />Info</TabsTrigger>
                            <TabsTrigger value="metrics"><Activity className="w-4 h-4 mr-2" />System</TabsTrigger>
                        </TabsList>
                        <TabsContent value="info" className="space-y-4 mt-4">
                             <Card className="bg-black/20 border-white/10 p-4 space-y-3">
                                <div className="flex justify-between"><span className="text-white/50">E2B ID</span><span className="font-mono text-purple-400">{sandbox.sandboxId}</span></div>
                                <div className="flex justify-between"><span className="text-white/50">Template</span><span>{sandbox.templateId}</span></div>
                                <div className="flex justify-between"><span className="text-white/50">Started At</span><span>{new Date(sandbox.startedAt).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-white/50">Expires At</span><span>{new Date(sandbox.endAt).toLocaleString()}</span></div>
                             </Card>
                             <div className="flex gap-4">
                                <Button variant="destructive" className="flex-1" onClick={handleTerminate} disabled={isTerminating || sandbox.state === 'killed'}>
                                    {isTerminating ? <Loader2 className="animate-spin mr-2"/> : <Trash2 className="w-4 h-4 mr-2"/>}
                                    Shutdown Sandbox
                                </Button>
                             </div>
                        </TabsContent>
                        <TabsContent value="metrics" className="mt-4">
                            <div className="h-64 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-white/40">
                                Real-time CPU/Mem metrics streaming coming soon
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN PAGE COMPONENT ---

export default function SandboxesPage() {
    const { getToken } = useAuth();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSandbox, setSelectedSandbox] = useState<Sandbox | null>(null);
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'monitoring' | 'list'>('list');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchSandboxes = useCallback(async (quiet = false) => {
        if (!quiet) setIsLoading(true);
        try {
            const token = await getToken();
            const response = await fetch('/api/v1/sandboxes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            
            // Map Backend Schema to Frontend Props
            const mapped = data.map((s: any) => ({
                id: s.id,
                sandboxId: s.sandboxId, // Matches serialization_alias in Pydantic
                templateId: s.templateId,
                state: s.state,
                metadata: s.metadata || {},
                startedAt: s.startedAt,
                endAt: s.endAt
            }));
            setSandboxes(mapped);
        } catch (err) {
            toast.error("Failed to load live sandboxes");
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchSandboxes();
        const interval = setInterval(() => fetchSandboxes(true), 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, [fetchSandboxes]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchSandboxes();
    };

    const activeCount = useMemo(() => sandboxes.filter(s => s.state === 'running').length, [sandboxes]);

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
                isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
            )}>
                {/* Top Bar */}
                <div className="flex items-center justify-end gap-4 p-4 border-b border-white/10 bg-black/50">
                    <div className="flex items-center gap-2">
                        <Activity className={cn("w-4 h-4", activeCount > 0 ? "text-green-400" : "text-white/40")} />
                        <span className="text-xs text-white/60 tracking-wider">LIVE CLOUD</span>
                    </div>
                    <div className="text-sm text-white/80 font-medium">
                        {activeCount} Active Environments
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-white/60 hover:text-white"
                    >
                        <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <SandboxSidebar isExpanded={true} onMouseEnter={() => {}} onMouseLeave={() => {}} />
                    
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                        <header className="mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">Agentic Runtime</h2>
                                    <p className="text-white/50 text-sm">Monitor and manage your E2B cloud sandboxes.</p>
                                </div>
                                <Button className="bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20" onClick={() => setCreateDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Sandbox
                                </Button>
                            </div>
                            
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                <TabsList className="bg-black/30 border border-white/10 p-1">
                                    <TabsTrigger value="list" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                                        Active Sandboxes
                                    </TabsTrigger>
                                    <TabsTrigger value="monitoring" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                                        Usage Monitoring
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="list" className="mt-8">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                            <p className="text-white/40">Fetching cloud status...</p>
                                        </div>
                                    ) : sandboxes.length === 0 ? (
                                        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                            <GrCodeSandbox className="w-12 h-12 mx-auto text-white/20 mb-4" />
                                            <h3 className="text-lg font-medium">No sandboxes found</h3>
                                            <p className="text-white/40 mb-6">Start your first environment to see it here.</p>
                                            <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>Create Environment</Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            <AnimatePresence>
                                                {sandboxes.map(sandbox => (
                                                    <SandboxCard key={sandbox.id} sandbox={sandbox} onSelect={() => setSelectedSandbox(sandbox)} />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </TabsContent>
                                
                                <TabsContent value="monitoring">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <MetricCard label="Compute Hours" value="1.2" unit="hrs" />
                                        <MetricCard label="Active Sessions" value={activeCount.toString()} unit="env" />
                                        <MetricCard label="Success Rate" value="99.8" unit="%" />
                                    </div>
                                    <div className="h-80 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center text-white/30">
                                        Cluster usage visualization coming soon
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </header>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedSandbox && (
                        <SandboxDetailView 
                            sandbox={selectedSandbox} 
                            onClose={() => setSelectedSandbox(null)} 
                            onAction={fetchSandboxes} 
                        />
                    )}
                </AnimatePresence>
                
                <CreateSandboxDialog 
                    open={isCreateDialogOpen} 
                    onOpenChange={setCreateDialogOpen} 
                    onCreated={fetchSandboxes} 
                />
            </main>
        </div>
    );
}

const MetricCard = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
    <Card className="bg-black/40 border-white/10 p-6">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-sm text-purple-400">{unit}</span>
        </div>
    </Card>
);

// --- CREATE DIALOG ---

const CreateSandboxDialog = ({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void, onCreated: () => void }) => {
    const { getToken } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        template_id: 'base',
        timeout: 300
    });

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            const token = await getToken();
            const res = await fetch('/api/v1/sandboxes', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    template_id: formData.template_id,
                    timeout_seconds: formData.timeout,
                    metadata: { name: formData.name }
                })
            });
            if (res.ok) {
                toast.success("Sandbox provisioned successfully");
                onCreated();
                onOpenChange(false);
            }
        } catch (e) {
            toast.error("Failed to create sandbox");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black/90 border-white/15 text-white">
                <DialogHeader>
                    <DialogTitle>Provision Cloud Sandbox</DialogTitle>
                    <DialogDescription>Launch a secure E2B virtual machine for code execution.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Friendly Name</Label>
                        <Input 
                            placeholder="Analysis Sandbox" 
                            className="bg-black/50 border-white/20" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Template ID</Label>
                        <Input 
                            placeholder="base" 
                            className="bg-black/50 border-white/20"
                            value={formData.template_id}
                            onChange={e => setFormData({...formData, template_id: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Timeout (seconds)</Label>
                        <Input 
                            type="number" 
                            className="bg-black/50 border-white/20"
                            value={formData.timeout}
                            onChange={e => setFormData({...formData, timeout: parseInt(e.target.value)})}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-purple-600 hover:bg-purple-500" onClick={handleCreate} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                        Provision Sandbox
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};