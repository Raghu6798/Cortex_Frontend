'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from './Input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Bot,
  Users,
  BrainCircuit,
} from 'lucide-react';

//--- TYPES AND SCHEMAS ---
type Architecture = 'mono' | 'multi';
type Framework = string;

// FINAL CORRECTED ZOD SCHEMA
const configSchema = z.object({
  apiKey: z.string().min(1, { message: 'API Key is required.' }),
  modelName: z.string().default('gpt-4o-mini'),
  temperature: z.coerce
    .number() // REMOVED the custom error message object from here
    .min(0, "Must be at least 0")
    .max(2, "Must be at most 2")
    .default(0.7),
  baseUrl: z
    .string()
    .url({ message: "Must be a valid URL." })
    .optional()
    .or(z.literal(''))
    .default('https://api.openai.com/v1'),
  systemPrompt: z.string().optional().default('You are a helpful AI assistant.'),
});
type ConfigFormData = z.infer<typeof configSchema>;

export interface AgentState {
  architecture: Architecture | null;
  framework: Framework | null;
  settings: Partial<ConfigFormData>;
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
  { id: 'review', title: 'Review & Create' },
];

//--- MAIN COMPONENT ---
export default function AgentBuilder({ onAgentCreated }: { onAgentCreated: (config: AgentState) => void; }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [agentState, setAgentState] = useState<AgentState>({ architecture: null, framework: null, settings: {} });

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

  const handleSelection = (key: 'architecture' | 'framework', value: Architecture | Framework) => {
    setAgentState((prev) => ({ ...prev, [key]: value }));
    handleNext();
  };

  const handleConfigSubmit = (settings: ConfigFormData) => {
    setAgentState((prev) => ({ ...prev, settings }));
    handleNext();
  };

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
    <div className="w-full max-w-3xl mx-auto p-6 rounded-lg shadow-lg bg-black/30 border border-white/15">
      {/* Progress Bar */}
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

      {/* Step Content */}
      <div className="overflow-hidden relative h-96">
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
            {currentStep === 3 && <StepReview agentState={agentState} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
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

const StepArchitecture = ({ onSelect }: { onSelect: (arch: Architecture) => void; }) => (
  <div>
    <StepHeader title="Select Agent Architecture" description="Choose between a single agent or a team of collaborating agents." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChoiceCard icon={<Bot />} title="Mono-Agent" description="A single, powerful agent for handling various tasks." onClick={() => onSelect('mono')} />
      <ChoiceCard icon={<Users />} title="Multi-Agent" description="A team of specialized agents that collaborate on complex goals." onClick={() => onSelect('multi')} />
    </div>
  </div>
);

const StepFramework = ({ architecture, onSelect }: { architecture: Architecture; onSelect: (fw: Framework) => void; }) => {
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
    resolver: zodResolver(configSchema),
    defaultValues: {
        apiKey: defaultValues.apiKey || '',
        modelName: defaultValues.modelName || 'gpt-4o-mini',
        temperature: defaultValues.temperature || 0.7,
        baseUrl: defaultValues.baseUrl || 'https://api.openai.com/v1',
        systemPrompt: defaultValues.systemPrompt || 'You are a helpful AI assistant.',
    }
  });

  return (
    <div>
      <StepHeader title="Configure LangChain Agent" description="Provide API credentials and settings for your agent." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-lg mx-auto">
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input id="apiKey" type="password" placeholder="sk-..." {...register('apiKey')} className={cn(errors.apiKey && 'border-destructive')} />
          {errors.apiKey && <p className="text-sm text-destructive mt-1">{errors.apiKey.message}</p>}
        </div>
        <div>
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input id="baseUrl" type="text" {...register('baseUrl')} className={cn(errors.baseUrl && 'border-destructive')} />
          {errors.baseUrl && <p className="text-sm text-destructive mt-1">{errors.baseUrl.message}</p>}
        </div>
        <div>
          <Label htmlFor="temperature">Temperature</Label>
          <Input id="temperature" type="number" step="0.1" {...register('temperature')} className={cn(errors.temperature && 'border-destructive')} />
          {errors.temperature && <p className="text-sm text-destructive mt-1">{errors.temperature.message}</p>}
        </div>
         <div>
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Input id="systemPrompt" type="text" {...register('systemPrompt')} />
        </div>
        <Button type="submit" className="w-full !mt-6 bg-purple-600 hover:bg-purple-500">
          Save Configuration <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
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
            </div>
        </div>
    );
};


//--- HELPER & UI COMPONENTS ---
const ChoiceCard = ({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; }) => (
  <button onClick={onClick} className="p-6 border-2 border-gray-700 rounded-lg text-left hover:border-purple-500 hover:bg-purple-900/20 transition-all group">
    <div className="text-purple-400 mb-2 group-hover:scale-110 transition-transform">{React.cloneElement(icon as React.ReactElement, { size: 32 })}</div>
    <h3 className="font-semibold text-lg text-white">{title}</h3>
    <p className="text-sm text-white/70">{description}</p>
  </button>
);

const FrameworkCard = ({ id, name, logo, onClick }: { id: string; name: string; logo: string | null; onClick: () => void; }) => (
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