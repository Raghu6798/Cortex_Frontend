"use client";

import React, { useState } from 'react'; // <-- THE FIX IS HERE
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from './Input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, ArrowRight, ArrowLeft, Bot, Users, BrainCircuit, Globe, KeyRound, PlusCircle, Trash2, BookText
} from 'lucide-react';

//--- TYPES AND SCHEMAS ---

// LLM Configuration
interface ConfigFormData {
  apiKey: string;
  modelName: string;
  temperature: number;
  baseUrl: string;
  systemPrompt: string;
}

// Tool Configuration
export interface ToolParam {
  id: string;
  key: string;
  value: string; // This can be a placeholder like "{{user_input}}"
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  api_url: string;
  api_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  api_headers: ToolParam[];
  api_query_params: ToolParam[];
  // Future: api_body_params: ToolParam[];
}

// Main Agent State
export interface AgentState {
  architecture: 'mono' | 'multi' | null;
  framework: string | null;
  settings: Partial<ConfigFormData>;
  tools: ToolConfig[];
}

//--- FRAMEWORK DATA ---
const frameworks = {
  mono: [
    { id: 'langchain', name: 'LangChain', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png' },
    { id: 'llama_index', name: 'LlamaIndex', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/llamaindex-color.png' },
    { id: 'langgraph', name: 'LangGraph', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langgraph-color.png' },
    { id: 'adk', name: 'Google ADK', logo: 'https://google.github.io/adk-docs/assets/agent-development-kit.png' },
    { id: 'pydantic_ai', name: 'Pydantic AI', logo: 'https://pbs.twimg.com/profile_images/1884966723746435073/x0p8ngPD_400x400.jpg' },
  ],
  multi: [
    { id: 'crewai', name: 'CrewAI', logo: 'https://pbs.twimg.com/profile_images/1735749323755069440/eJ33h_cW_400x400.jpg' },
    { id: 'autogen', name: 'Autogen', logo: 'https://microsoft.github.io/autogen/img/flaml.svg' },
    { id: 'agno', name: 'Agno', logo: null },
    { id: 'ag2', name: 'AG2', logo: null },
  ],
};

const STEPS = [
  { id: 'architecture', title: 'Architecture' },
  { id: 'framework', title: 'Framework' },
  { id: 'configure', title: 'Configure' },
  { id: 'tools', title: 'Tools' },
  { id: 'review', title: 'Review & Create' },
];

//--- MAIN COMPONENT ---
export default function AgentBuilder({ onAgentCreated }: { onAgentCreated: (config: AgentState) => void; }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [agentState, setAgentState] = useState<AgentState>({
      architecture: null,
      framework: null,
      settings: {},
      tools: [],
    });

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
        setDirection(1);
        setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
        setDirection(-1);
        setCurrentStep(currentStep - 1);
        }
    };

    const handleSelection = (key: 'architecture' | 'framework', value: any) => {
        setAgentState((prev) => ({ ...prev, [key]: value }));
        handleNext();
    };

    const handleConfigSubmit = (settings: ConfigFormData) => {
        setAgentState((prev) => ({ ...prev, settings }));
        handleNext();
    };

    const handleToolsSubmit = (tools: ToolConfig[]) => {
      setAgentState((prev) => ({...prev, tools}));
      handleNext();
    }

    const handleFinalSubmit = () => {
        console.log('Final Agent Configuration:', agentState);
        onAgentCreated(agentState);
    };

    const isNextDisabled = () => {
        if (currentStep === 0 && !agentState.architecture) return true;
        if (currentStep === 1 && !agentState.framework) return true;
        if (currentStep === 2 && agentState.framework === 'langchain' && Object.keys(agentState.settings).length === 0) return true;
        return false;
    };

    const variants = {
        enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 50 : -50 }),
        center: { opacity: 1, x: 0 },
        exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -50 : 50 }),
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 rounded-lg shadow-lg bg-black/30 border border-white/15">
            <div className="mb-8">
                <Progress value={progress} className="h-2 bg-white/10" />
                <div className="flex justify-between mt-2">
                {STEPS.map((step, i) => (
                    <div key={step.id} className="flex flex-col items-center">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                        i < currentStep ? 'bg-purple-600 text-white' :
                        i === currentStep ? 'bg-purple-600 text-white ring-2 ring-purple-400/50' :
                        'bg-gray-700 text-gray-400')}>
                        {i < currentStep ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block text-white/80">{step.title}</span>
                    </div>
                ))}
                </div>
            </div>
            <div className="overflow-hidden relative h-[450px]"> {/* Adjusted height for more space */}
                <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="absolute w-full"
                >
                    {currentStep === 0 && <StepArchitecture onSelect={(arch) => handleSelection('architecture', arch)} />}
                    {currentStep === 1 && agentState.architecture && <StepFramework architecture={agentState.architecture} onSelect={(fw) => handleSelection('framework', fw)} />}
                    {currentStep === 2 && agentState.framework === 'langchain' && <StepConfigure onSubmit={handleConfigSubmit} defaultValues={agentState.settings} />}
                    {currentStep === 2 && agentState.framework !== 'langchain' && <ComingSoonStep />}
                    {currentStep === 3 && <StepConfigureTools onSubmit={handleToolsSubmit} defaultTools={agentState.tools}/>}
                    {currentStep === 4 && <StepReview agentState={agentState} />}
                </motion.div>
                </AnimatePresence>
            </div>
            <div className="flex justify-between pt-4 mt-4 border-t border-white/15">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className={cn(currentStep === 0 && 'invisible')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {currentStep === STEPS.length - 1 ? (
                <Button onClick={handleFinalSubmit} className="bg-purple-600 hover:bg-purple-500">
                    Create Agent <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
                ) : (
                <Button onClick={handleNext} disabled={isNextDisabled()} className={cn(isNextDisabled() && 'invisible', 'bg-purple-600 hover:bg-purple-500')}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                )}
            </div>
        </div>
    );
}

//--- STEP SUB-COMPONENTS ---

const StepHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-sm text-white/70">{description}</p>
    </div>
);

const StepArchitecture = ({ onSelect }: { onSelect: (arch: 'mono' | 'multi') => void; }) => (
    <div>
      <StepHeader title="Select Agent Architecture" description="Choose between a single agent or a team of collaborating agents." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
        <ChoiceCard icon={<Bot />} title="Mono-Agent" description="A single, powerful agent for handling various tasks." onClick={() => onSelect('mono')} />
        <ChoiceCard icon={<Users />} title="Multi-Agent" description="A team of specialized agents that collaborate on complex goals." onClick={() => onSelect('multi')} />
      </div>
    </div>
);
  
const StepFramework = ({ architecture, onSelect }: { architecture: 'mono' | 'multi'; onSelect: (fw: string) => void; }) => {
    const availableFrameworks = frameworks[architecture];
    return (
      <div>
        <StepHeader title="Choose Your Framework" description={`Select the ${architecture === 'mono' ? 'mono-agent' : 'multi-agent'} framework you want to build with.`} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableFrameworks.map((fw) => (
            <FrameworkCard key={fw.id} {...fw} onClick={() => onSelect(fw.id)} />
          ))}
        </div>
      </div>
    );
};

const StepConfigure = ({ onSubmit, defaultValues }: { onSubmit: SubmitHandler<ConfigFormData>; defaultValues: Partial<ConfigFormData> }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ConfigFormData>({
    defaultValues: {
      apiKey: defaultValues.apiKey || '',
      modelName: defaultValues.modelName || 'meta-llama/llama-4-maverick-17b-128e-instruct',
      temperature: defaultValues.temperature ?? 1.0,
      baseUrl: defaultValues.baseUrl || '',
      systemPrompt: defaultValues.systemPrompt || '',
    },
  });

  return (
    <div>
      <StepHeader title="Configure LangChain Agent" description="Provide API credentials and settings for your agent." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-lg mx-auto">
        <div><Label htmlFor="apiKey">API Key</Label><Input id="apiKey" type="password" placeholder="sk-..." {...register('apiKey', { required: 'API Key is required.' })} className={cn(errors.apiKey && 'border-destructive')}/>{errors.apiKey && <p className="text-sm text-destructive mt-1">{errors.apiKey.message}</p>}</div>
        <div><Label htmlFor="baseUrl">Base URL</Label><Input id="baseUrl" type="text" placeholder="https://api.openai.com/v1" {...register('baseUrl')} className={cn(errors.baseUrl && 'border-destructive')}/>{errors.baseUrl && <p className="text-sm text-destructive mt-1">{errors.baseUrl.message}</p>}</div>
        <div><Label htmlFor="temperature">Temperature</Label><Input id="temperature" type="number" step="0.1" {...register('temperature', { valueAsNumber: true, min: 0, max: 2 })} className={cn(errors.temperature && 'border-destructive')}/>{errors.temperature && <p className="text-sm text-destructive mt-1">{errors.temperature.message}</p>}</div>
        <div><Label htmlFor="systemPrompt">System Prompt</Label><Input id="systemPrompt" type="text" placeholder="You are a helpful assistant." {...register('systemPrompt')} /></div>
        <Button type="submit" className="w-full !mt-6 bg-purple-600 hover:bg-purple-500">Save Configuration & Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </form>
    </div>
  );
};

const StepConfigureTools = ({ onSubmit, defaultTools }: { onSubmit: (tools: ToolConfig[]) => void; defaultTools: ToolConfig[] }) => {
  const [tools, setTools] = useState<ToolConfig[]>(defaultTools.length > 0 ? defaultTools : []);

  const addTool = () => {
    setTools([...tools, { id: `tool-${Date.now()}`, name: '', description: '', api_url: '', api_method: 'GET', api_headers: [], api_query_params: [] }]);
  };

  const removeTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };
  
  const updateToolField = (id: string, field: keyof ToolConfig, value: any) => {
    setTools(tools.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const updateToolParam = (toolId: string, paramType: 'api_headers' | 'api_query_params', paramId: string, field: 'key' | 'value', value: string) => {
    setTools(tools.map(tool => {
      if (tool.id !== toolId) return tool;
      const updatedParams = tool[paramType].map(p => p.id === paramId ? { ...p, [field]: value } : p);
      return { ...tool, [paramType]: updatedParams };
    }));
  };

  const addToolParam = (toolId: string, paramType: 'api_headers' | 'api_query_params') => {
    setTools(tools.map(tool => {
      if (tool.id !== toolId) return tool;
      const newParam: ToolParam = { id: `param-${Date.now()}`, key: '', value: '' };
      return { ...tool, [paramType]: [...tool[paramType], newParam] };
    }));
  };

  const removeToolParam = (toolId: string, paramType: 'api_headers' | 'api_query_params', paramId: string) => {
    setTools(tools.map(tool => {
      if (tool.id !== toolId) return tool;
      return { ...tool, [paramType]: tool[paramType].filter(p => p.id !== paramId) };
    }));
  };

  return (
    <div>
      <StepHeader title="Configure Agent Tools (Optional)" description="Define external APIs your agent can call. The LLM will decide when to use them." />
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2 pb-4">
        {tools.map((tool) => (
          <div key={tool.id} className="p-4 border border-white/15 rounded-lg bg-black/20 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-purple-300">New API Tool</h3>
              <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-900/50 hover:text-red-300" onClick={() => removeTool(tool.id)}><Trash2 size={16} /></Button>
            </div>
            <div className="space-y-2">
              <Input placeholder="Tool Name (e.g., searchWeather)" value={tool.name} onChange={e => updateToolField(tool.id, 'name', e.target.value)} />
              <Input placeholder="Description (e.g., 'Finds the weather for a city')" value={tool.description} onChange={e => updateToolField(tool.id, 'description', e.target.value)} />
              <div className="flex gap-2">
                <select value={tool.api_method} onChange={e => updateToolField(tool.id, 'api_method', e.target.value as ToolConfig['api_method'])} className="bg-black/50 border border-white/15 rounded-md px-2 py-2 text-sm">
                  <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                </select>
                <Input placeholder="API URL (e.g., https://api.weather.com/find)" value={tool.api_url} onChange={e => updateToolField(tool.id, 'api_url', e.target.value)} />
              </div>
            </div>

            {/* Query Parameters */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium text-white/80">Query Parameters</h4>
              {tool.api_query_params.map(p => (
                <div key={p.id} className="flex gap-2 items-center">
                  <Input placeholder="key (e.g., 'city')" value={p.key} onChange={e => updateToolParam(tool.id, 'api_query_params', p.id, 'key', e.target.value)} />
                  <Input placeholder="value (e.g., '{{city}}')" value={p.value} onChange={e => updateToolParam(tool.id, 'api_query_params', p.id, 'value', e.target.value)} />
                  <Button size="icon" variant="ghost" onClick={() => removeToolParam(tool.id, 'api_query_params', p.id)}><Trash2 size={14}/></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => addToolParam(tool.id, 'api_query_params')}><PlusCircle size={14} className="mr-2"/>Add Query Param</Button>
            </div>

            {/* Headers */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium text-white/80">Headers</h4>
              {tool.api_headers.map(h => (
                <div key={h.id} className="flex gap-2 items-center">
                  <Input placeholder="Header Name (e.g., 'Authorization')" value={h.key} onChange={e => updateToolParam(tool.id, 'api_headers', h.id, 'key', e.target.value)} />
                  <Input placeholder="Header Value (e.g., 'Bearer ...')" value={h.value} onChange={e => updateToolParam(tool.id, 'api_headers', h.id, 'value', e.target.value)} />
                  <Button size="icon" variant="ghost" onClick={() => removeToolParam(tool.id, 'api_headers', h.id)}><Trash2 size={14}/></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => addToolParam(tool.id, 'api_headers')}><PlusCircle size={14} className="mr-2"/>Add Header</Button>
            </div>

          </div>
        ))}
      </div>
      <div className="flex justify-between pt-4 border-t border-white/10">
        <Button variant="outline" onClick={addTool}><PlusCircle size={16} className="mr-2"/>Add New Tool</Button>
        <Button onClick={() => onSubmit(tools)} className="bg-purple-600 hover:bg-purple-500">Save Tools & Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>
  );
};

const StepReview = ({ agentState }: { agentState: AgentState }) => {
    const frameworkName = (agentState.architecture && frameworks[agentState.architecture]?.find(f => f.id === agentState.framework)?.name) || agentState.framework;
    return (
        <div>
            <StepHeader title="Review & Create" description="Confirm your agent's configuration below." />
            <div className="space-y-4 max-w-md mx-auto text-sm bg-black/20 p-6 rounded-lg border border-white/15">
                <div className="flex justify-between"><span className="text-white/70">Architecture:</span> <span className="font-medium text-white capitalize">{agentState.architecture}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Framework:</span> <span className="font-medium text-white">{frameworkName}</span></div>
                {agentState.framework === 'langchain' && (
                    <>
                        <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-white/70">Model:</span> <span className="font-medium text-white">{agentState.settings.modelName}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">Base URL:</span> <span className="font-medium text-white">{agentState.settings.baseUrl}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">Temperature:</span> <span className="font-medium text-white">{agentState.settings.temperature}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">API Key:</span> <span className="font-medium text-white font-mono">************</span></div>
                    </>
                )}
                {agentState.tools.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between">
                          <span className="text-white/70">Tools Configured:</span>
                          <span className="font-medium text-white">{agentState.tools.length}</span>
                      </div>
                      {agentState.tools.map(tool => (
                          <div key={tool.id} className="text-xs ml-4 mt-1">
                              <span className="font-semibold text-purple-400">{tool.name}</span>
                              <span className="text-white/60">: {tool.description.substring(0, 40)}...</span>
                          </div>
                      ))}
                  </div>
                )}
            </div>
        </div>
    );
};


//--- HELPER & UI COMPONENTS ---
const ChoiceCard = ({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; }) => (
  <button onClick={onClick} className="p-6 border-2 border-gray-700 rounded-lg text-left hover:border-purple-500 hover:bg-purple-900/20 transition-all group flex flex-col items-center text-center">
    <div className="text-purple-400 mb-2 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="font-semibold text-lg text-white">{title}</h3>
    <p className="text-sm text-white/70">{description}</p>
  </button>
);

const FrameworkCard = ({  name, logo, onClick }: { id: string; name: string; logo: string | null; onClick: () => void; }) => (
  <button onClick={onClick} className="p-4 border-2 border-gray-700 rounded-lg text-center hover:border-purple-500 hover:bg-purple-900/20 transition-all flex flex-col items-center justify-center h-28">
    {logo ? (
      <Image src={logo} alt={name} width={32} height={32} className="mb-2 h-8 w-8 object-contain" />
    ) : (
      <BrainCircuit className="mb-2 h-8 w-8 text-purple-400" />
    )}
    <h4 className="font-semibold text-sm text-white">{name}</h4>
  </button>
);

const ComingSoonStep = () => (
    <div className="text-center flex flex-col items-center justify-center h-full">
        <BrainCircuit size={48} className="text-purple-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">Configuration Coming Soon</h2>
        <p className="text-sm text-white/70">This framework is not yet configurable via the UI. You can proceed to create a default version.</p>
    </div>
);