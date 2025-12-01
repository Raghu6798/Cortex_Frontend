// app/dashboard/rag/page.tsx
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import UserProfileSidebar from '@/components/layout/UserProfileSidebar';
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
  Search,
  Zap,
  HardDrive,
  Save,
  Key,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBeamComponent } from '@/components/ui/general/AnimatedBeamComponent'; 
import Image from 'next/image';
import { Input } from '@/components/ui/shadcn/Input';
import { Label } from '@/components/ui/shadcn/label';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Switch } from '@/components/ui/shadcn/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { useAuth } from '@clerk/nextjs'; // Import useAuth to get the token

// --- TYPES AND MOCKS ---

type KnowledgeBaseStatus = 'Draft' | 'Processing' | 'Ready' | 'Error';
type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  status: KnowledgeBaseStatus;
  vectorDb: string;
  documentCount: number;
  chunkCount: number;
  lastUpdated: string;
};

// Secret Metadata Type (based on your SecretResponse schema)
type SecretMetadata = {
    id: string;
    name: string;
    created_at: string;
};

const mockKnowledgeBases: KnowledgeBase[] = []; 

const VectorDBs = [
    { name: 'Qdrant', logo: 'https://avatars.githubusercontent.com/u/73504361?s=280&v=4', status: 'ready', link: 'https://qdrant.tech' },
    { name: 'Chroma', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwgwHBIDmE0dMPTEitihmUXvAHTxEt8AyjvQ&s', status: 'ready', link: 'https://www.trychroma.com/' },
    { name: 'FAISS', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTniLzFNsjivwLiV6MNVgLMai5IWWHc0Frv3w&s', status: 'local', link: 'https://github.com/facebookresearch/faiss' },
    { name: 'Pinecone', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLhSrfueBZeHifvia4Vqhhd9QuqGQpi5UduA&s', status: 'ready', link: 'https://www.pinecone.io/' },
    { name: 'AstraDB', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY3tmF34Qk83eoATfnS4oCB-URNI9sxVuulA&s', status: 'ready', link: 'https://www.datastax.com/products/datastax-astra' },
    { name: 'Neo4j', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmOZuTqPb6LhxyTyEUio8xxNxspa0gm-NncQ&s', status: 'ready', link: 'https://neo4j.com/' },
];

const STEPS = [
  { id: 'setup', name: '1. Connection', icon: HardDrive },
  { id: 'data', name: '2. Data Sources', icon: UploadCloud },
  { id: 'config', name: '3. Chunking & Embeddings', icon: Settings2 },
  { id: 'process', name: '4. Index & Test', icon: CheckCircle2 },
];

// --- HOOK TO FETCH SECRETS ---
const useUserSecrets = () => {
    const { getToken } = useAuth();
    const [secrets, setSecrets] = useState<SecretMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSecrets = async () => {
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication token missing.");

                // NOTE: Use the established Next.js API proxy route
                const response = await fetch('/api/secrets', { 
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` } // Send token for proxy authentication
                });
                
                if (!response.ok) throw new Error("Failed to fetch secrets from API.");

                const data = await response.json();
                setSecrets(data);
            } catch (error) {
                console.error("Error fetching user secrets:", error);
                setSecrets([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSecrets();
    }, [getToken]);

    return { secrets, isLoading };
}

// --- RAG HOME VIEW COMPONENT ---
const RAGLandingView = ({ onCreateNew, onStartCreationWithDB }: { onCreateNew: () => void; onStartCreationWithDB: (dbName: string) => void; }) => {
    
    return (
        <div className='w-full'>
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Retrieval-Augmented Generation (RAG)</h2>
                <p className="text-white/60 mt-1">Select a vector backend to build your knowledge base.</p>
            </header>

            {/* Animated Beam Visualization */}
            <div className='mb-10 p-4 border border-white/10 rounded-xl bg-black/30'>
                <AnimatedBeamComponent 
                    nodes={VectorDBs} 
                    centerNode={{ name: 'Cortex Agent', logo: '/download.png', status: 'live' }}
                    onNodeClick={onStartCreationWithDB}
                />
            </div>
            
            <div className='text-center'>
                 <Button className="bg-purple-600 hover:bg-purple-500 text-lg px-8 py-6" onClick={onCreateNew}>
                    <Plus className="w-5 h-5 mr-3" />
                    + Create New Knowledge Base
                </Button>
            </div>
        </div>
    );
};


// --- DETAIL VIEWS ---

const KnowledgeBaseDetailView = ({ knowledgeBase, onBack, initialVectorDb }: { knowledgeBase: KnowledgeBase | null; onBack: () => void; initialVectorDb: string | null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const isEditing = useMemo(() => !!knowledgeBase, [knowledgeBase]);

  const handleNext = () => setActiveStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setActiveStep(s => Math.max(s - 1, 0));

  const renderStepContent = () => {
    switch (activeStep) {
        case 0: return <StepConnection initialVectorDb={initialVectorDb} setupData={knowledgeBase} />;
        case 1: return <StepDataSources />;
        case 2: return <StepConfiguration />;
        case 3: return <StepProcessTest />;
        default: return null;
    }
  }

  return (
    <div>
        <header className="mb-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <Button variant="outline" size="icon" className="bg-black/50 border-white/15" onClick={onBack}><ChevronLeft className="w-4 h-4"/></Button>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight">{isEditing ? `Manage: ${knowledgeBase?.name}` : 'Create New Knowledge Base'}</h2>
                    <p className="text-white/60 mt-1">Follow the steps to configure your data source.</p>
                </div>
            </div>
        </header>
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
            {STEPS.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                const Icon = step.icon;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center text-center cursor-pointer" onClick={() => setActiveStep(index)}>
                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all", 
                                isActive ? "bg-purple-500 border-purple-400" : isCompleted ? "bg-green-500 border-green-400" : "bg-gray-700 border-gray-500"
                            )}>
                                <Icon className="w-6 h-6"/>
                            </div>
                            <p className={cn("text-xs mt-2 w-20", isActive ? 'font-semibold text-white' : 'text-white/60')}>{step.name}</p>
                        </div>
                        {index < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 mx-2", isCompleted ? 'bg-green-400' : 'bg-gray-600')}></div>}
                    </React.Fragment>
                );
            })}
        </div>

        {/* Step Content */}
        <div className="p-8 rounded-lg bg-black/30 border border-white/15">
            <AnimatePresence mode="wait">
                <motion.div key={activeStep} initial={{ opacity: 0.5, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0.5, y: -10 }} className='min-h-[400px]'>
                    {renderStepContent()}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={activeStep === 0} className="bg-black/50 border-white/15">
                <ChevronLeft className='w-4 h-4 mr-2'/>
                Back
            </Button>
            {activeStep === STEPS.length - 1 ? (
                <Button className="bg-green-600 hover:bg-green-500" onClick={() => console.log('Final Submit')}>
                    {isEditing ? 'Save Changes' : 'Create Knowledge Base'}
                    <Save className='w-4 h-4 ml-2'/>
                </Button>
            ) : (
                <Button className="bg-purple-600 hover:bg-purple-500" onClick={handleNext}>
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            )}
        </div>
    </div>
  );
};

// --- STEP 1: CONNECTION (Updated for Secrets)---
const StepConnection = ({ setupData, initialVectorDb }: { setupData: KnowledgeBase | null; initialVectorDb: string | null }) => {
    const [selectedDB, setSelectedDB] = useState(setupData?.vectorDb || initialVectorDb || VectorDBs[0].name);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [selectedSecret, setSelectedSecret] = useState<string | null>(null);
    const { secrets, isLoading: isLoadingSecrets } = useUserSecrets();


    const handleTestConnection = () => {
        setConnectionStatus('testing');
        setTimeout(() => {
            if (Math.random() > 0.1) { // 90% success rate
                setConnectionStatus('success');
            } else {
                setConnectionStatus('error');
            }
        }, 1500);
    };

    return (
        <div className='space-y-6 max-w-2xl mx-auto'>
            <h3 className='text-xl font-bold text-white'>1. Select Vector Database & Connection Details</h3>
            
            <div className='grid grid-cols-3 gap-4'>
                {VectorDBs.map(db => (
                    <div 
                        key={db.name} 
                        onClick={() => setSelectedDB(db.name)} 
                        className={cn('p-4 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center text-center',
                            selectedDB === db.name ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'
                        )}
                    >
                         {db.logo && <Image src={db.logo} alt={db.name} width={40} height={40} className='mb-2 rounded-md object-contain'/>}
                         <p className='text-sm font-semibold'>{db.name}</p>
                         <Badge variant='outline' className={cn('mt-1 border-none', db.status === 'ready' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300')}>
                             {db.status === 'ready' ? 'Cloud' : 'Local'}
                         </Badge>
                    </div>
                ))}
            </div>

            <Card className='bg-black/20 border-white/10 space-y-4 p-6'>
                <h4 className='text-lg font-semibold'>{selectedDB} Connection</h4>
                 
                 {/* API Key Selector (New Logic) */}
                <div className="space-y-2">
                    <Label className='text-white flex items-center gap-2'>
                        <Key className='w-4 h-4'/> API Key / Token (from Secrets)
                    </Label>
                    <div className="flex items-center space-x-2">
                        {isLoadingSecrets ? (
                            <div className="w-full h-10 bg-black/50 rounded-md animate-pulse flex items-center px-4">
                                <Loader2 className='w-4 h-4 mr-2 animate-spin text-white/50'/> Loading Secrets...
                            </div>
                        ) : (
                            <Select onValueChange={setSelectedSecret} value={selectedSecret || ""}>
                                <SelectTrigger className="w-full bg-black/50 border-white/15 text-white placeholder:text-white/50">
                                    <SelectValue placeholder={secrets.length === 0 ? "No secrets found. Create one first." : "Select an API Key Secret"} />
                                </SelectTrigger>
                                <SelectContent className='bg-black/80 border-white/15 text-white'>
                                    {secrets.length > 0 ? (
                                        secrets.map(secret => (
                                            <SelectItem key={secret.id} value={secret.name}>
                                                <div className='flex items-center gap-2'>
                                                    <Shield className='w-3 h-3 text-purple-400'/>
                                                    {secret.name}
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-secrets" disabled>No secrets available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                        <Button variant="outline" size="icon" className='bg-black/50 border-white/15 hover:bg-white/10' onClick={() => console.log('Go to Secrets')}>
                            <Shield className='w-4 h-4 text-purple-400'/>
                        </Button>
                    </div>
                    {selectedSecret && <p className='text-xs text-green-400 mt-1 flex items-center gap-1'><CheckCircle2 className='w-3 h-3'/> Using secret: **{selectedSecret}**</p>}
                </div>
                 
                 <InputWithLabel label="Environment / Host URL" placeholder="e.g., https://[id].svc.pinecone.io" />
                 <InputWithLabel label="Index / Collection Name" placeholder="e.g., cortex-rag-index" />
                <div className='flex items-center justify-between pt-2'>
                    <Button onClick={handleTestConnection} disabled={connectionStatus === 'testing' || !selectedSecret} className='bg-blue-600 hover:bg-blue-500'>
                        {connectionStatus === 'testing' ? <Loader2 className='w-4 h-4 mr-2 animate-spin'/> : <Zap className='w-4 h-4 mr-2'/>}
                        Test Connection
                    </Button>
                    {connectionStatus === 'success' && <span className='text-green-400 flex items-center'><CheckCircle2 className='w-4 h-4 mr-1'/> Connected</span>}
                    {connectionStatus === 'error' && <span className='text-red-400 flex items-center'><X className='w-4 h-4 mr-1'/> Failed</span>}
                </div>
            </Card>

            <div className='space-y-4 pt-4 border-t border-white/10'>
                <InputWithLabel label="Knowledge Base Name" placeholder="e.g., Product Documentation KB" />
                <TextareaWithLabel label="Description" placeholder="A brief description of the knowledge source" rows={2}/>
            </div>
        </div>
    );
};

// --- STEP 2: DATA SOURCES ---
const StepDataSources = () => {
    const [fileUploads, setFileUploads] = useState<string[]>([]);
    const [useOCR, setUseOCR] = useState(false);

    const handleFileUpload = () => setFileUploads([...fileUploads, `file-${fileUploads.length + 1}.pdf`]);
    const handleRemoveFile = (file: string) => setFileUploads(fileUploads.filter(f => f !== file));

    return (
        <div className='space-y-6 max-w-3xl mx-auto'>
            <h3 className='text-xl font-bold text-white'>2. Select Data Sources</h3>
            
            <div className='grid grid-cols-2 gap-6'>
                <SourceCard icon={File} title="Upload Documents" description="PDF, DOCX, TXT. Securely stored and processed." onClick={handleFileUpload}/>
                <SourceCard icon={Search} title="Web Crawler / URL" description="Crawl a sitemap or list of URLs for content." onClick={() => console.log('Web Source')}/>
                <SourceCard icon={Zap} title="Integrations" description="Connect to GitHub, Notion, Confluence (Coming Soon)." onClick={() => console.log('Integrations')}/>
            </div>

            <Card className='bg-black/20 border-white/10 space-y-4 p-6'>
                <h4 className='text-lg font-semibold mb-2'>Files to Index ({fileUploads.length})</h4>
                <div className='h-40 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-white/50 p-4 overflow-y-auto'>
                    {fileUploads.length === 0 ? (
                        <>
                            <UploadCloud className='w-6 h-6 mb-2'/>
                            <p className='text-sm'>Drag & drop files here, or click "Upload Documents"</p>
                        </>
                    ) : (
                        <div className='w-full space-y-2'>
                            {fileUploads.map(file => (
                                <div key={file} className='flex items-center justify-between p-2 bg-black/30 rounded-md'>
                                    <span className='text-sm text-white'>{file}</span>
                                    <Button size='icon' variant='ghost' onClick={() => handleRemoveFile(file)}><X className='w-4 h-4 text-red-400'/></Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className='flex items-center justify-between pt-4 border-t border-white/10'>
                    <Label htmlFor='ocr-toggle' className='text-white flex flex-col'>
                        <span className='font-semibold'>Pre-Process with OCR (Recommended for complex PDFs)</span>
                        <span className='text-xs text-white/60'>Uses Cortex OCR service to convert images/scans to clean text before chunking.</span>
                    </Label>
                    <Switch id='ocr-toggle' checked={useOCR} onCheckedChange={setUseOCR} className='data-[state=checked]:bg-purple-600'/>
                </div>
            </Card>
        </div>
    );
};

const SourceCard = ({ icon: Icon, title, description, onClick }: { icon: React.ElementType, title: string, description: string, onClick: () => void }) => (
    <div onClick={onClick} className='p-4 border border-white/15 rounded-lg bg-black/20 hover:bg-black/30 transition-colors cursor-pointer space-y-2'>
        <Icon className='w-6 h-6 text-purple-400'/>
        <h5 className='font-semibold text-white'>{title}</h5>
        <p className='text-xs text-white/70'>{description}</p>
    </div>
);


// --- STEP 3: CONFIGURATION ---
const StepConfiguration = () => {
    // NOTE: This step would also ideally use the secret selector for the Embedding API Key
    return (
        <div className='space-y-6 max-w-2xl mx-auto'>
            <h3 className='text-xl font-bold text-white'>3. Chunking and Embedding Configuration</h3>
            
            <Card className='bg-black/20 border-white/10 p-6 space-y-4'>
                <h4 className='text-lg font-semibold mb-3'>Chunking Strategy</h4>
                 <InputWithLabel label="Chunk Size (Tokens)" type="number" defaultValue={512} min={100} max={4096} />
                 <InputWithLabel label="Chunk Overlap (Tokens)" type="number" defaultValue={50} min={0} max={512} />
                 <InputWithLabel label="Chunking Strategy" defaultValue="Recursive Text Splitter" disabled />
                 <div className='text-sm text-white/70 pt-2 border-t border-white/10'>
                     <p>Estimated total chunks: **~3,500**</p>
                     <p className='text-xs text-white/60'>Based on average document size and current settings.</p>
                 </div>
            </Card>

            <Card className='bg-black/20 border-white/10 p-6 space-y-4'>
                <h4 className='text-lg font-semibold mb-3'>Embedding Model</h4>
                 <InputWithLabel label="Embedding Model" placeholder="Select Embedding Model" defaultValue="text-embedding-ada-002" />
                 <InputWithLabel label="Embedding API Key" type="password" placeholder="Enter API Key (Should be selected from Secrets)" />
                 <InputWithLabel label="Embedding Dimensions" type="number" defaultValue={1536} disabled/>
            </Card>
        </div>
    );
};

// --- STEP 4: PROCESS & TEST ---
const StepProcessTest = () => {
    const [isIndexing, setIsIndexing] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const handleStartIndexing = useCallback(() => {
        setIsIndexing(true);
        setLog([]);
        setProgress(0);
        let currentProgress = 0;
        const totalSteps = 10;

        const interval = setInterval(() => {
            if (currentProgress < totalSteps) {
                currentProgress += 1;
                const newProgress = (currentProgress / totalSteps) * 100;
                setProgress(newProgress);
                setLog(prev => [
                    ...prev, 
                    `[${new Date().toLocaleTimeString()}] Processing step ${currentProgress}/${totalSteps}: Chunking and embedding...`
                ]);
            } else {
                clearInterval(interval);
                setIsIndexing(false);
                setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ INDEXING COMPLETE! Knowledge Base is now live.`]);
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className='space-y-6'>
            <h3 className='text-xl font-bold text-white'>4. Indexing & Live Testing</h3>
            
            <Card className='bg-black/20 border-white/10 p-6 space-y-4'>
                <h4 className='text-lg font-semibold'>Indexing Progress</h4>
                <Button 
                    onClick={handleStartIndexing} 
                    disabled={isIndexing} 
                    className='bg-green-600 hover:bg-green-500'
                >
                    {isIndexing ? <Loader2 className='w-4 h-4 mr-2 animate-spin'/> : <ListChecks className='w-4 h-4 mr-2'/>}
                    {isIndexing ? `Indexing... ${Math.round(progress)}%` : 'Start Indexing'}
                </Button>
                
                {isIndexing && <div className='w-full h-2 rounded-full bg-white/10'><motion.div initial={{width: '0%'}} animate={{width: `${progress}%`}} transition={{duration: 0.5}} className='h-2 bg-purple-500 rounded-full'></motion.div></div>}

                <div className='h-40 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white/70 overflow-y-auto font-mono scrollbar-hide'>
                    {log.length === 0 ? "Click 'Start Indexing' to begin processing your documents." : log.map((line, index) => <p key={index}>{line}</p>)}
                </div>
            </Card>

            <Card className='bg-black/20 border-white/10 p-6 space-y-4'>
                <h4 className='text-lg font-semibold'>Test Retrieval (Live)</h4>
                <Textarea placeholder="Ask a question about your indexed documents..." rows={3} disabled={isIndexing || progress !== 100}/>
                <Button disabled={isIndexing || progress !== 100} className='bg-purple-600 hover:bg-purple-500'>
                    <Search className='w-4 h-4 mr-2'/>
                    Test RAG Query
                </Button>
                <div className='pt-3 border-t border-white/10 text-sm text-white/80'>
                    <p className='font-semibold'>Retrieval Result:</p>
                    <p className='text-white/60'>[Results will appear here after testing]</p>
                </div>
            </Card>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function RAGPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isUserSidebarExpanded, setIsUserSidebarExpanded] = useState(false);
  const [view, setView] = useState<'landing' | 'detail'>('landing'); 
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [initialVectorDb, setInitialVectorDb] = useState<string | null>(null); 

  const handleCreateNew = () => {
    setSelectedKb(null); 
    setInitialVectorDb(null); 
    setView('detail');
  };
  
  const handleStartCreationWithDB = (dbName: string) => {
     setSelectedKb(null); 
     setInitialVectorDb(dbName); 
     setView('detail');
  };

  const handleManageKb = (kb: KnowledgeBase) => {
    setSelectedKb(kb);
    setInitialVectorDb(kb.vectorDb);
    setView('detail');
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        onNewAgentClick={() => {}}
        activeView={'rag'}
      />
      <main className={cn(
        'flex-1 flex flex-col p-6 md:p-8 transition-all duration-300 ease-in-out',
        isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20',
        isUserSidebarExpanded ? 'xl:mr-72' : 'xl:mr-24'
      )}>
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div key="landing" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className='w-full'>
              <RAGLandingView onCreateNew={handleCreateNew} onStartCreationWithDB={handleStartCreationWithDB} />
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className='w-full'>
              <KnowledgeBaseDetailView knowledgeBase={selectedKb} onBack={() => setView('landing')} initialVectorDb={initialVectorDb} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <UserProfileSidebar
        isExpanded={isUserSidebarExpanded}
        onMouseEnter={() => setIsUserSidebarExpanded(true)}
        onMouseLeave={() => setIsUserSidebarExpanded(false)}
      />
    </div>
  );
}

// Re-export Input and Textarea with Label support for cleaner usage in sub-components
const InputWithLabel = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input> & { label: string }>(({ label, ...props }, ref) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <Input ref={ref} {...props} className={cn(props.className, 'bg-black/50 border-white/15 text-white placeholder:text-white/50')} />
    </div>
));
InputWithLabel.displayName = "InputWithLabel";

const TextareaWithLabel = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof Textarea> & { label: string }>(({ label, ...props }, ref) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <Textarea ref={ref} {...props} className={cn(props.className, 'bg-black/50 border-white/15 text-white placeholder:text-white/50')} />
    </div>
));
TextareaWithLabel.displayName = "TextareaWithLabel";