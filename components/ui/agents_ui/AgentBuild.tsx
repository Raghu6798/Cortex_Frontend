// components/ui/agents_ui/AgentBuild.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/Input';
import { Label } from '@/components/ui/shadcn/label';
import { Progress } from "@/components/ui/shadcn/progress";
import ProviderSelector from './ProviderSelector';
import ClassicLoader from '@/components/ui/general/ClassicLoader';
import { apiClient, Secret } from '@/lib/apiClient';
import { useAuth } from '@clerk/nextjs';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Bot, Users, BrainCircuit, PlusCircle, Trash2, Key, Shield, Mic, Terminal
} from 'lucide-react';
import { Switch } from '@/components/ui/shadcn/switch';
import { toast } from 'sonner';


//--- TYPES AND SCHEMAS ---

// LLM Configuration
interface ConfigFormData {
  apiKey: string;
  modelName: string;
  temperature: number;
  baseUrl: string;
  systemPrompt: string;
  providerId: string;
  modelId: string;
  
  // MCP Configuration
  mcp_adapter: boolean;
  mcp_transport: 'sse' | 'http';
  mcp_url: string;

  // Sandbox Configuration
  attached_sandbox_id?: string;
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
  api_headers: ToolParam[] | Record<string, string>;
  api_query_params: ToolParam[] | Record<string, string>;
  api_path_params: ToolParam[] | Record<string, string>;
  dynamic_boolean: boolean;
  dynamic_variables: Record<string, string>;
  request_payload: string;
}

// Main Agent State
export interface AgentState {
  agentType: 'textual' | 'voice' | 'coding' | null;
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
    { id: 'pydantic_ai', name: 'Pydantic AI', logo: 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=400,height=400/event-covers/7b/af750bca-5957-41ca-9c6f-c47553f4ff2d.png' },
  ],
  multi: [
    { id: 'agno', name: 'Agno', logo: 'https://pbs.twimg.com/profile_images/1884966723746435073/x0p8ngPD_400x400.jpg' },
  ],
};

const STEPS = [
  { id: 'agentType', title: 'Agent Type' },
  { id: 'architecture', title: 'Architecture' },
  { id: 'framework', title: 'Framework' },
  { id: 'configure', title: 'Configure' },
  { id: 'tools', title: 'Tools' },
  { id: 'review', title: 'Review & Create' },
];

//--- MAIN COMPONENT ---
export default function AgentBuilder({ onAgentCreated }: { onAgentCreated: (config: AgentState) => void; }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState<string | null>(null);
    const [agentState, setAgentState] = useState<AgentState>({
      agentType: null,
      architecture: null,
      framework: null,
      settings: {},
      tools: [],
    });

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
        setIsLoading(true);
        // Simulate a brief loading transition
        setTimeout(() => {
            setDirection(1);
            setCurrentStep(currentStep + 1);
            setIsLoading(false);
        }, 500);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
        setDirection(-1);
        setCurrentStep(currentStep - 1);
        }
    };

    const handleSelection = (key: 'agentType' | 'architecture' | 'framework', value: string) => {
        setAgentState((prev) => ({ ...prev, [key]: value }));
        
        // If voice agent is selected, redirect to voice chat interface
        if (key === 'agentType' && value === 'voice') {
            router.push('/dashboard?view=voice-chat');
            return;
        }
        
        // If coding agent is selected, continue with configuration
        if (key === 'agentType' && value === 'coding') {
            handleNext();
            return;
        }
        
        // If multi-agent architecture is selected, redirect immediately to workflow builder
        if (key === 'architecture' && value === 'multi') {
            router.push('/dashboard/builder');
            return;
        }
        
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

    const handleFinalSubmit = async () => {
        setIsLoading(true);
        setLoadingText(null);
        
        try {
            // Check for Coding Agent - Trigger Sandbox Creation
            let attachedSandboxId: string | undefined = undefined;

            if (agentState.agentType === 'coding') {
                setLoadingText("Spinning up secure cloud runtime...");
                toast.info("Initializing E2B Cloud Sandbox...");
                
                try {
                    const sandboxRes = await fetch('/api/v1/sandboxes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            template_id: 'base',
                            timeout_seconds: 300,
                            metadata: {
                                created_by: 'agent_builder',
                                type: 'coding_agent_runtime'
                            }
                        })
                    });

                    if (sandboxRes.ok) {
                        const sandboxData = await sandboxRes.json();
                        attachedSandboxId = sandboxData.id;
                        toast.success("Secure Cloud Runtime Ready!");
                    } else {
                        throw new Error("Failed to create sandbox");
                    }
                } catch (sbxError) {
                    console.error("Sandbox creation failed:", sbxError);
                    toast.error("Failed to provision cloud sandbox. Agent will operate without isolated runtime.");
                }
            }
            
            setLoadingText("Finalizing Agent...");

            // Transform tools to backend format
            const transformedTools = (agentState.tools || []).map(tool => {
                // Convert ToolParam arrays to simple key-value objects
                const headers: Record<string, string> = {};
                if (Array.isArray(tool.api_headers)) {
                    tool.api_headers.forEach(param => {
                        if (param.key && param.value) {
                            headers[param.key] = param.value;
                        }
                    });
                } else if (tool.api_headers && typeof tool.api_headers === 'object') {
                    Object.assign(headers, tool.api_headers);
                }

                const queryParams: Record<string, string> = {};
                if (Array.isArray(tool.api_query_params)) {
                    tool.api_query_params.forEach(param => {
                        if (param.key && param.value) {
                            queryParams[param.key] = param.value;
                        }
                    });
                } else if (tool.api_query_params && typeof tool.api_query_params === 'object') {
                    Object.assign(queryParams, tool.api_query_params);
                }

                const pathParams: Record<string, string> = {};
                if (Array.isArray(tool.api_path_params)) {
                    tool.api_path_params.forEach(param => {
                        if (param.key && param.value) {
                            pathParams[param.key] = param.value;
                        }
                    });
                } else if (tool.api_path_params && typeof tool.api_path_params === 'object') {
                    Object.assign(pathParams, tool.api_path_params);
                }

                return {
                    name: tool.name,
                    description: tool.description,
                    api_url: tool.api_url,
                    api_method: tool.api_method,
                    api_headers: headers,
                    api_query_params: queryParams,
                    api_path_params: pathParams,
                    dynamic_boolean: tool.dynamic_boolean || false,
                    dynamic_variables: tool.dynamic_variables || {},
                    request_payload: tool.request_payload || ''
                };
            });

            // Create agent in database
            const agentData = {
                name: `${agentState.framework} Agent`,
                description: `A ${agentState.architecture} agent built with ${agentState.framework}`,
                architecture: agentState.architecture,
                framework: agentState.framework,
                settings: {
                    ...agentState.settings,
                    attached_sandbox_id: attachedSandboxId
                },
                tools: transformedTools
            };

            const response = await fetch('/api/agents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agentData),
            });

            if (response.ok) {
                const createdAgent = await response.json();
    
                // Add provider and model info to the agent state
                const enhancedAgentState = {
                    ...agentState,
                    AgentId: createdAgent.id, // Backend returns AgentId as 'id' in response
                    provider_id: agentState.settings.providerId,
                    model_id: agentState.settings.modelId
                };
                
                // Switch view first
                onAgentCreated(enhancedAgentState);
                
                // Only redirect if it's explicitly a multi-agent workflow
                // For mono/textual, onAgentCreated switches the view component to 'chat' within DashboardContent
                if (agentState.architecture === 'multi') {
                    router.push('/dashboard/builder');
                }
            } else {
                console.error('Failed to create agent:', await response.text());
                // Fallback: still show chat UI with what we have
                const enhancedAgentState = {
                    ...agentState,
                    provider_id: agentState.settings.providerId,
                    model_id: agentState.settings.modelId
                };
                onAgentCreated(enhancedAgentState);
            }
        } catch (error) {
            console.error('Error creating agent:', error);
            // Fallback - still call onAgentCreated
            const enhancedAgentState = {
                ...agentState,
                provider_id: agentState.settings.providerId,
                model_id: agentState.settings.modelId
            };
            onAgentCreated(enhancedAgentState);
        } finally {
            setIsLoading(false);
            setLoadingText(null);
        }
    };

    const isNextDisabled = () => {
        if (currentStep === 0 && !agentState.architecture) return true;
        if (currentStep === 1 && !agentState.framework) return true;
        if (currentStep === 2) return true; // Hide Next button on configure step - form has its own submit
        return false;
    };

    const variants = {
        enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 50 : -50 }),
        center: { opacity: 1, x: 0 },
        exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -50 : 50 }),
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 rounded-lg shadow-lg bg-black/30 border border-white/15 flex flex-col min-h-[500px] max-h-[1200px] relative">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-4">
                        <ClassicLoader />
                        <p className="text-white/80 text-sm">
                            {loadingText || (currentStep === STEPS.length - 1 ? 'Creating your agent...' : 'Loading...')}
                        </p>
                    </div>
                </div>
            )}
            
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
            <div className="flex-1 flex flex-col min-h-0"> {/* Flexible container */}
                <div className="flex-1 flex items-start justify-center py-8 overflow-y-auto"> {/* Content with consistent padding and scroll */}
                    <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-4xl mx-auto"
                    >
        {currentStep === 0 && <StepAgentType onSelect={(type) => handleSelection('agentType', type)} />}
        {currentStep === 1 && agentState.agentType === 'textual' && <StepArchitecture onSelect={(arch) => handleSelection('architecture', arch)} />}
        {currentStep === 1 && agentState.agentType === 'coding' && <StepFramework architecture="mono" onSelect={(fw) => handleSelection('framework', fw)} />}
        {currentStep === 2 && agentState.architecture && <StepFramework architecture={agentState.architecture} onSelect={(fw) => handleSelection('framework', fw)} />}
        {currentStep === 3 && agentState.framework === 'langchain' && <StepConfigure onSubmit={handleConfigSubmit} defaultValues={agentState.settings} />}
        {currentStep === 3 && agentState.framework !== 'langchain' && <ComingSoonStep />}
        {currentStep === 4 && <StepConfigureTools onSubmit={handleToolsSubmit} defaultTools={agentState.tools}/>}
        {currentStep === 5 && <StepReview agentState={agentState} />}
                    </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-white/15 mt-auto">
                <Button 
                    variant="outline" 
                    onClick={handlePrev} 
                    disabled={currentStep === 0 || isLoading} 
                    className={cn(
                        currentStep === 0 && 'invisible',
                        'bg-white text-black hover:bg-gray-100 border-white'
                    )}
                >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {currentStep === STEPS.length - 1 ? (
                <Button 
                    onClick={handleFinalSubmit} 
                    disabled={isLoading}
                    className="bg-white text-black hover:bg-gray-100"
                >
                    {isLoading ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                            <span className="ml-2">Creating...</span>
                        </>
                    ) : (
                        <>
                            Create Agent <CheckCircle2 className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
                ) : (
                <Button 
                    onClick={handleNext} 
                    disabled={isNextDisabled() || isLoading} 
                    className={cn(
                        isNextDisabled() && 'invisible', 
                        'bg-white text-black hover:bg-gray-100'
                    )}
                >
                    {isLoading ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                            <span className="ml-2">Loading...</span>
                        </>
                    ) : (
                        <>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
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

const StepAgentType = ({ onSelect }: { onSelect: (type: 'textual' | 'voice' | 'coding') => void; }) => (
    <div className="w-full">
        <StepHeader title="Choose Agent Type" description="Select the type of AI agent you want to build." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <ChoiceCard 
            icon={<Bot />} 
            title="Textual Agent" 
            description="Traditional text-based AI agent for chat interfaces and API interactions." 
            onClick={() => onSelect('textual')} 
        />
        <ChoiceCard 
            icon={<Mic />} 
            title="Voice Agent" 
            description="Real-time voice AI agent with LiveKit integration for audio conversations." 
            onClick={() => onSelect('voice')} 
        />
        <ChoiceCard 
            icon={<Terminal />} 
            title="Coding Agent" 
            description="Secure Python coding assistant with E2B sandbox execution for safe code running." 
            onClick={() => onSelect('coding')} 
        />
        </div>
    </div>
);

const StepArchitecture = ({ onSelect }: { onSelect: (arch: 'mono' | 'multi') => void; }) => (
    <div className="w-full">
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
        <div className="w-full">
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
    const [selectedProvider, setSelectedProvider] = useState(defaultValues.providerId || '');
    const [selectedModel, setSelectedModel] = useState(defaultValues.modelId || '');
    
    const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<ConfigFormData>({
    defaultValues: {
        apiKey: defaultValues.apiKey || '',
        modelName: defaultValues.modelName || '',
        temperature: defaultValues.temperature ?? 0.7,
        baseUrl: defaultValues.baseUrl || '',
        systemPrompt: defaultValues.systemPrompt || 'You are a helpful AI assistant.',
        providerId: defaultValues.providerId || '',
        modelId: defaultValues.modelId || '',
        mcp_adapter: defaultValues.mcp_adapter || false,
        mcp_transport: defaultValues.mcp_transport || 'http',
        mcp_url: defaultValues.mcp_url || ''
    },
    });

    const mcpEnabled = watch("mcp_adapter");

    const handleProviderChange = (providerName: string) => {
        console.log('Provider changed to:', providerName);
        setSelectedProvider(providerName);
        setValue('providerId', providerName);
    };

    const handleModelChange = (modelId: string) => {
        setSelectedModel(modelId);
        setValue('modelId', modelId);
        setValue('modelName', modelId);
    };


    return (
    <div className="w-full">
        <StepHeader title="Configure LangChain Agent" description="Select your LLM provider and model, then configure the settings." />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
        {/* Provider and Model Selection */}
        <div className="bg-black/20 p-6 rounded-lg border border-white/15">
            <ProviderSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            />
        </div>

        {/* API Configuration */}
        <div className="space-y-4">
            <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
                id="apiKey" 
                type="password" 
                placeholder="sk-..." 
                {...register('apiKey', { required: 'API Key is required.' })} 
                className={cn(errors.apiKey && 'border-destructive')}
            />
            {errors.apiKey && <p className="text-sm text-destructive mt-1">{errors.apiKey.message}</p>}
            </div>
            
            <div>
            <Label htmlFor="temperature">Temperature</Label>
            <Input 
                id="temperature" 
                type="number" 
                step="0.1" 
                {...register('temperature', { valueAsNumber: true, min: 0, max: 2 })} 
                className={cn(errors.temperature && 'border-destructive')}
            />
            {errors.temperature && <p className="text-sm text-destructive mt-1">{errors.temperature.message}</p>}
            </div>
            
            <div>
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <textarea 
                id="systemPrompt" 
                placeholder="You are a helpful assistant." 
                {...register('systemPrompt')}
                className="flex min-h-[80px] w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
                />
            </div>

            {/* --- NEW MCP ADAPTER SECTION --- */}
            <div className="bg-black/20 p-6 rounded-lg border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-1.5 rounded-md">
                            <Image 
                                src="https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/mcp.png" 
                                alt="MCP Logo" 
                                width={24} 
                                height={24} 
                                className="object-contain"
                            />
                        </div>
                        <div className="space-y-0.5">
                            <Label className="text-base font-medium text-white">MCP Adapter</Label>
                            <p className="text-sm text-white/60">Connect to Model Context Protocol servers</p>
                        </div>
                    </div>
                    <Switch
                        checked={mcpEnabled}
                        onCheckedChange={(checked) => setValue("mcp_adapter", checked)}
                        className="data-[state=checked]:bg-purple-600"
                    />
                </div>

                {mcpEnabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4 pt-4 border-t border-white/10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <Label htmlFor="mcp_transport">Transport Mode</Label>
                                <select
                                    {...register("mcp_transport")}
                                    className="flex h-10 w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none mt-2"
                                >
                                    <option value="http">Streamable HTTP</option>
                                    <option value="sse">SSE (Server-Sent Events)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="mcp_url">MCP Server URL</Label>
                                <Input
                                    id="mcp_url"
                                    placeholder={mcpEnabled ? "http://localhost:8000/mcp" : ""}
                                    {...register("mcp_url", { 
                                        required: mcpEnabled ? "MCP URL is required when adapter is enabled" : false 
                                    })}
                                    className="bg-black/50 border-white/15 text-white mt-2"
                                />
                                {errors.mcp_url && <p className="text-sm text-destructive mt-1">{errors.mcp_url.message}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                            <Shield className="h-4 w-4" />
                            <span>Tools from this server will be dynamically loaded and available to the agent at runtime.</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
        
        {/* Hidden submit button - triggered by form's submit event */}
        <div className="flex justify-end pt-6 border-t border-white/15">
            <Button 
            type="submit" 
            className="bg-white text-black hover:bg-gray-100"
            >
            Save Configuration <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
        </form>
    </div>
    );
};

const StepConfigureTools = ({ onSubmit, defaultTools }: { onSubmit: (tools: ToolConfig[]) => void; defaultTools: ToolConfig[] }) => {
    const { getToken } = useAuth();
    const [secrets, setSecrets] = useState<Secret[]>([]);
    
    const [tools, setTools] = useState<ToolConfig[]>(defaultTools.length > 0 ? defaultTools : [
    { id: `tool-${Date.now()}`, name: '', description: '', api_url: '', api_method: 'GET', api_headers: [], api_query_params: [], api_path_params: [], dynamic_boolean: false, dynamic_variables: {}, request_payload: '' }
    ]);

    const loadSecrets = React.useCallback(async () => {
    try {
        const token = await getToken();
        if (token) {
        const secretsData = await apiClient.getSecrets(token);
        setSecrets(secretsData);
        }
    } catch (error) {
        console.error('Failed to load secrets:', error);
    }
    }, [getToken]);

    // Load secrets on component mount
    useEffect(() => {
    loadSecrets();
    }, [loadSecrets]);

    const addTool = () => {
    setTools([...tools, { id: `tool-${Date.now()}`, name: '', description: '', api_url: '', api_method: 'GET', api_headers: [], api_query_params: [], api_path_params: [], dynamic_boolean: false, dynamic_variables: {}, request_payload: '' }]);
    };

    const removeTool = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
    };
    
    const updateToolField = (id: string, field: keyof ToolConfig, value: string | ToolParam[] | boolean | Record<string, string>) => {
    setTools(tools.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const updateToolParam = (toolId: string, paramType: 'api_headers' | 'api_query_params' | 'api_path_params', paramId: string, field: 'key' | 'value', value: string) => {
    setTools(tools.map(tool => {
        if (tool.id !== toolId) return tool;
        const currentParams = tool[paramType];
        if (Array.isArray(currentParams)) {
        const updatedParams = currentParams.map(p => p.id === paramId ? { ...p, [field]: value } : p);
        return { ...tool, [paramType]: updatedParams };
        }
        return tool;
    }));
    };

    const addToolParam = (toolId: string, paramType: 'api_headers' | 'api_query_params' | 'api_path_params') => {
    setTools(tools.map(tool => {
        if (tool.id !== toolId) return tool;
        const currentParams = tool[paramType];
        if (Array.isArray(currentParams)) {
        const newParam: ToolParam = { id: `param-${Date.now()}`, key: '', value: '' };
        return { ...tool, [paramType]: [...currentParams, newParam] };
        }
        return tool;
    }));
    };

    const removeToolParam = (toolId: string, paramType: 'api_headers' | 'api_query_params' | 'api_path_params', paramId: string) => {
    setTools(tools.map(tool => {
        if (tool.id !== toolId) return tool;
        const currentParams = tool[paramType];
        if (Array.isArray(currentParams)) {
        return { ...tool, [paramType]: currentParams.filter(p => p.id !== paramId) };
        }
        return tool;
    }));
    };

    const addSecretAsHeader = (toolId: string, secretName: string) => {
    const newHeader: ToolParam = { 
        id: `header-${Date.now()}`, 
        key: 'Authorization', 
        value: `Bearer {{${secretName}}}` 
    };
    setTools(tools.map(tool => {
        if (tool.id !== toolId) return tool;
        const currentHeaders = tool.api_headers;
        if (Array.isArray(currentHeaders)) {
        return { ...tool, api_headers: [...currentHeaders, newHeader] };
        }
        return tool;
    }));
    };

    return (
    <div className="w-full">
        <StepHeader title="Configure Agent Tools (Optional)" description="Define external APIs your agent can call. The LLM will decide when to use them." />
        <div className="space-y-4 min-h-[200px] max-h-[800px] overflow-y-auto scrollbar-hide">
        <AnimatePresence>
            {tools.map((tool) => (
            <motion.div 
                key={tool.id} 
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-4 border border-white/15 rounded-lg bg-black/20 space-y-3"
            >
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-purple-300">New API Tool</h3>
                <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-900/50 hover:text-red-300" onClick={() => removeTool(tool.id)}><Trash2 size={16} /></Button>
            </div>
            <div className="space-y-2">
                <Input 
                placeholder="Tool Name (e.g., searchWeather)" 
                value={tool.name} 
                onChange={e => updateToolField(tool.id, 'name', e.target.value)}
                className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                />
                <Input 
                placeholder="Description (e.g., 'Finds the weather for a city')" 
                value={tool.description} 
                onChange={e => updateToolField(tool.id, 'description', e.target.value)}
                className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                />
                <div className="flex gap-2">
                <select value={tool.api_method} onChange={e => updateToolField(tool.id, 'api_method', e.target.value as ToolConfig['api_method'])} className="bg-black/50 border border-white/15 rounded-md px-2 py-2 text-sm">
                    <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                </select>
                <Input 
                    placeholder={tool.dynamic_boolean ? "API URL (e.g., https://api.weather.com/{{city}})" : "API URL (e.g., https://api.weather.com/find)"}
                    value={tool.api_url} 
                    onChange={e => updateToolField(tool.id, 'api_url', e.target.value)}
                    className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                />
                </div>
            </div>

            {/* Dynamic Variables Toggle */}
            <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white/80">Enable Dynamic Variable Injection</h4>
                <Switch
                    checked={tool.dynamic_boolean || false}
                    onCheckedChange={(checked) => updateToolField(tool.id, 'dynamic_boolean', checked)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-500 border-purple-500/30"
                />
                </div>
                {tool.dynamic_boolean && (
                <p className="text-xs text-purple-300/80">When enabled, {`{{ }}`} placeholders in any field will be replaced by the agent&apos;s tool call arguments.</p>
                )}
            </div>

            {/* Request Payload */}
            <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium text-white/80">Request Payload (Optional)</h4>
                <textarea
                placeholder={tool.dynamic_boolean ? "Enter JSON payload (e.g., {\"name\": \"{{userName}}\", \"email\": \"{{userEmail}}\"}) - {{ }} values replaced by agent's tool call arguments" : "Enter JSON payload (e.g., {\"name\": \"John\", \"email\": \"john@example.com\"})"}
                value={tool.request_payload}
                onChange={e => updateToolField(tool.id, 'request_payload', e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
                />
            </div>

            {/* Path Parameters */}
            <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium text-white/80">Path Parameters</h4>
                {Array.isArray(tool.api_path_params) && tool.api_path_params.map(p => (
                <div key={p.id} className="flex gap-2 items-center">
                    <Input 
                    placeholder="key (e.g., 'userId')" 
                    value={p.key} 
                    onChange={e => updateToolParam(tool.id, 'api_path_params', p.id, 'key', e.target.value)}
                    className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                    />
                    <Input 
                    placeholder={tool.dynamic_boolean ? "value (e.g., '{{userId}}') - replaced by agent's tool call arguments" : "value (e.g., '123')"}
                    value={p.value} 
                    onChange={e => updateToolParam(tool.id, 'api_path_params', p.id, 'value', e.target.value)}
                    className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeToolParam(tool.id, 'api_path_params', p.id)}><Trash2 size={14}/></Button>
                </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addToolParam(tool.id, 'api_path_params')} className="bg-black/50 border-white/15 text-white hover:bg-black/70 hover:border-white/25"><PlusCircle size={14} className="mr-2"/>Add Path Param</Button>
            </div>

            {/* Query Parameters */}
            <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium text-white/80">Query Parameters</h4>
                {Array.isArray(tool.api_query_params) && tool.api_query_params.map(p => (
                <div key={p.id} className="flex gap-2 items-center">
                    <Input 
                    placeholder="key (e.g., 'city')" 
                    value={p.key} 
                    onChange={e => updateToolParam(tool.id, 'api_query_params', p.id, 'key', e.target.value)}
                    className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                    />
                    <Input 
                    placeholder={tool.dynamic_boolean ? "value (e.g., '{{city}}') - replaced by agent's tool call arguments" : "value (e.g., 'New York')"}
                    value={p.value} 
                    onChange={e => updateToolParam(tool.id, 'api_query_params', p.id, 'value', e.target.value)}
                    className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeToolParam(tool.id, 'api_query_params', p.id)}><Trash2 size={14}/></Button>
                </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addToolParam(tool.id, 'api_query_params')} className="bg-black/50 border-white/15 text-white hover:bg-black/70 hover:border-white/25"><PlusCircle size={14} className="mr-2"/>Add Query Param</Button>
            </div>

            {/* Headers */}
            <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium text-white/80">Headers</h4>
                {Array.isArray(tool.api_headers) && tool.api_headers.map(h => (
                <div key={h.id} className="flex gap-2 items-center">
                    <Input 
                    placeholder="Header Name (e.g., 'Authorization')" 
                    value={h.key} 
                    onChange={e => updateToolParam(tool.id, 'api_headers', h.id, 'key', e.target.value)}
                    className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                    />
                    <Input 
                    placeholder={tool.dynamic_boolean ? "Header Value (e.g., 'Bearer {{token}}') - {{ }} replaced by agent's tool call arguments" : "Header Value (e.g., 'Bearer abc123')"}
                    value={h.value} 
                    onChange={e => updateToolParam(tool.id, 'api_headers', h.id, 'value', e.target.value)}
                    className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeToolParam(tool.id, 'api_headers', h.id)}><Trash2 size={14}/></Button>
                </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addToolParam(tool.id, 'api_headers')} className="bg-black/50 border-white/15 text-white hover:bg-black/70 hover:border-white/25"><PlusCircle size={14} className="mr-2"/>Add Header</Button>
            </div>

            {/* Secret Selection for Authentication */}
            {secrets.length > 0 && (
                <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <h4 className="text-sm font-medium text-white/80">Use Saved Secret for Authentication</h4>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {secrets.map(secret => (
                    <Button
                        key={secret.id}
                        size="sm"
                        variant="outline"
                        onClick={() => addSecretAsHeader(tool.id, secret.name)}
                        className="bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400"
                    >
                        <Key className="h-3 w-3 mr-1" />
                        {secret.name}
                    </Button>
                    ))}
                </div>
                <p className="text-xs text-white/60">
                    This will add an Authorization header with your secret value
                </p>
                </div>
            )}

            </motion.div>
            ))}
        </AnimatePresence>
        </div>
        <div className="flex justify-between pt-4 border-t border-white/10">
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <Button variant="outline" onClick={addTool} className="bg-white text-black hover:bg-gray-100 border-white"><PlusCircle size={16} className="mr-2"/>Add New Tool</Button>
        </motion.div>
        </div>
            <div className="flex justify-between pt-4 border-t border-white/10">
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
                        <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-white/70">Provider:</span> <span className="font-medium text-white">{agentState.settings.providerId}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">Model:</span> <span className="font-medium text-white">{agentState.settings.modelName}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">Base URL:</span> <span className="font-medium text-white">{agentState.settings.baseUrl}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">Temperature:</span> <span className="font-medium text-white">{agentState.settings.temperature}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">API Key:</span> <span className="font-medium text-white font-mono">************</span></div>
                        
                        {agentState.settings.mcp_adapter && (
                            <div className="flex flex-col pt-2 border-t border-white/10">
                                <div className="flex justify-between"><span className="text-white/70">MCP Adapter:</span> <span className="font-medium text-green-400">Enabled</span></div>
                                <div className="flex justify-between"><span className="text-white/70">Transport:</span> <span className="font-medium text-white uppercase">{agentState.settings.mcp_transport}</span></div>
                                <div className="flex justify-between"><span className="text-white/70">URL:</span> <span className="font-medium text-white truncate max-w-[200px]">{agentState.settings.mcp_url}</span></div>
                            </div>
                        )}
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
  <button onClick={onClick} className="p-6 border-2 border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-900/20 transition-all group flex flex-col items-center text-center">
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