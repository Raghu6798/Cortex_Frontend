'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  File, 
  Settings2,
  ListChecks,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA & TYPES ---
type KnowledgeBaseStatus = 'Ready' | 'Processing' | 'Error';
type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  status: KnowledgeBaseStatus;
  documentCount: number;
  chunkCount: number;
  lastUpdated: string;
};

const mockKnowledgeBases: KnowledgeBase[] = [
  { id: 'kb1', name: 'Product Documentation', description: 'All official product docs for the main app.', status: 'Ready', documentCount: 12, chunkCount: 1402, lastUpdated: '2 hours ago' },
  { id: 'kb2', name: 'API Reference', description: 'Technical API reference and usage examples.', status: 'Ready', documentCount: 5, chunkCount: 876, lastUpdated: '1 day ago' },
  { id: 'kb3', name: 'Support Tickets - Q3', description: 'Archived support tickets for trend analysis.', status: 'Processing', documentCount: 150, chunkCount: 12034, lastUpdated: '10 minutes ago' },
  { id: 'kb4', name: 'Onboarding Guides', description: 'Guides for new employee onboarding.', status: 'Error', documentCount: 3, chunkCount: 0, lastUpdated: '3 days ago' },
];

// --- SUB-COMPONENTS ---

const KnowledgeBaseList = ({ onCreateNew, onManage }: { onCreateNew: () => void; onManage: (kb: KnowledgeBase) => void }) => {
    const [kbs] = useState(mockKnowledgeBases);
    
    return (
        <>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Knowledge Bases</h2>
                    <p className="text-white/60 mt-1">Manage data sources to give your agents long-term memory and knowledge.</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-500" onClick={onCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Knowledge Base
                </Button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {kbs.map(kb => <KnowledgeBaseCard key={kb.id} kb={kb} onManage={() => onManage(kb)} />)}
            </div>
        </>
    );
};

const KnowledgeBaseCard = ({ kb, onManage }: { kb: KnowledgeBase; onManage: () => void }) => {
    const statusStyles = {
        Ready: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
        Processing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        Error: { icon: X, color: 'text-red-400', bg: 'bg-red-500/10' },
    };
    const StatusIcon = statusStyles[kb.status].icon;

    return (
        <Card className="bg-black/30 border-white/15 hover:border-purple-500/50 transition-all duration-300 group flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-white group-hover:text-purple-300 transition-colors">{kb.name}</CardTitle>
                    <Badge variant="outline" className={`border-none ${statusStyles[kb.status].bg} ${statusStyles[kb.status].color}`}>
                        <StatusIcon className={`w-3 h-3 mr-1 ${kb.status === 'Processing' && 'animate-spin'}`} />
                        {kb.status}
                    </Badge>
                </div>
                <CardDescription className="text-white/70 pt-2">{kb.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div className="flex justify-between text-sm text-white/60">
                    <div className="flex items-center gap-2"><File className="w-4 h-4" /><span>{kb.documentCount} Documents</span></div>
                    <div className="flex items-center gap-2"><ListChecks className="w-4 h-4" /><span>{kb.chunkCount} Chunks</span></div>
                </div>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                     <p className="text-xs text-white/50">Updated {kb.lastUpdated}</p>
                    <Button size="sm" className="bg-white/10 hover:bg-white/20" onClick={onManage}>
                        Manage <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const STEPS = [
  { id: 'setup', name: 'Setup', icon: Settings2 },
  { id: 'data', name: 'Data Sources', icon: UploadCloud },
  { id: 'config', name: 'Configuration', icon: Settings2 },
  { id: 'process', name: 'Process & Test', icon: CheckCircle2 },
];

const KnowledgeBaseDetailView = ({ knowledgeBase, onBack }: { knowledgeBase: KnowledgeBase | null; onBack: () => void }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setActiveStep(s => Math.max(s - 1, 0));

  return (
    <div>
        <header className="mb-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <Button variant="outline" size="icon" className="bg-black/50 border-white/15" onClick={onBack}><ChevronLeft className="w-4 h-4"/></Button>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight">{knowledgeBase ? `Manage: ${knowledgeBase.name}` : 'Create New Knowledge Base'}</h2>
                    <p className="text-white/60 mt-1">Follow the steps to configure your data source.</p>
                </div>
            </div>
        </header>
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
            {STEPS.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center text-center">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all", 
                                isActive ? "bg-purple-500 border-purple-400" : isCompleted ? "bg-green-500 border-green-400" : "bg-gray-700 border-gray-500"
                            )}>
                                <step.icon className="w-5 h-5"/>
                            </div>
                            <p className={cn("text-xs mt-2", isActive ? 'font-semibold text-white' : 'text-white/60')}>{step.name}</p>
                        </div>
                        {index < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 mx-4", isCompleted ? 'bg-green-400' : 'bg-gray-600')}></div>}
                    </React.Fragment>
                );
            })}
        </div>

        {/* Step Content */}
        <div className="p-8 rounded-lg bg-black/30 border border-white/15">
            <AnimatePresence mode="wait">
                <motion.div key={activeStep} initial={{ opacity: 0.5, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0.5, y: -10 }}>
                    {activeStep === 0 && <div>Step 1: Setup Content</div>}
                    {activeStep === 1 && <div>Step 2: Data Sources Content</div>}
                    {activeStep === 2 && <div>Step 3: Configuration Content</div>}
                    {activeStep === 3 && <div>Step 4: Process & Test Content</div>}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={activeStep === 0} className="bg-black/50 border-white/15">Back</Button>
            <Button className="bg-purple-600 hover:bg-purple-500" onClick={handleNext} disabled={activeStep === STEPS.length - 1}>Next</Button>
        </div>
    </div>
  );
};

// --- MAIN CONTENT COMPONENT ---
export default function RAGContent() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);

  const handleCreateNew = () => {
    setSelectedKb(null); // Clear any selected KB to signify creation
    setView('detail');
  };

  const handleManageKb = (kb: KnowledgeBase) => {
    setSelectedKb(kb);
    setView('detail');
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'list' ? (
        <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          <KnowledgeBaseList onCreateNew={handleCreateNew} onManage={handleManageKb} />
        </motion.div>
      ) : (
        <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <KnowledgeBaseDetailView knowledgeBase={selectedKb} onBack={() => setView('list')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
