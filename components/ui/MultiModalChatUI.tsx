'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NextImage from 'next/image';
import { SectionReveal } from './SectionReveal';
import { useAuth, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Plus, SendHorizonal, Bot, User, Trash2, Settings,Paperclip, X, Image as ImageIcon, Video, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MagicCard } from './MagicCard';
import { Skeleton } from './skeleton'; // Import the new skeleton component

// --- FRAMEWORK CONFIGURATION & TYPES ---
const FRAMEWORK_DETAILS = {
  langchain: { name: 'LangChain Agent', description: 'Use the powerful and flexible LangChain agent framework.', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png', enabled: true },
  llama_index: { name: 'LlamaIndex Workflow', description: 'Build with LlamaIndex\'s event-driven ReAct agent.', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/llamaindex-color.png', enabled: true },
  pydantic_ai: { name: 'Pydantic AI', description: 'Leverage Pydantic for structured AI outputs (coming soon).', logo: 'https://pbs.twimg.com/profile_images/1884966723746435073/x0p8ngPD_400x400.jpg', enabled: false },
  langgraph: { name: 'LangGraph', description: 'Build stateful, multi-actor applications (coming soon).', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langgraph-color.png', enabled: false },
  adk: { name: 'Google ADK', description: 'Explore Google\'s Agent Development Kit (coming soon).', logo: 'https://google.github.io/adk-docs/assets/agent-development-kit.png', enabled: false }
};
type AgentFramework = keyof typeof FRAMEWORK_DETAILS;

// --- ZOD SCHEMA & TYPES ---
const agentConfigSchema = z.object({
  api_key: z.string().trim().min(1, 'API Key is required.'),
  model_name: z.string().trim().min(1, 'Model Name is required.'),
  temperature: z.number().min(0).max(2),
  top_p: z.number().min(0).max(1),
  top_k: z.number().min(0).optional().nullable(),
  system_prompt: z.string().optional(),
  base_url: z.string().url().optional().or(z.literal('')),
});
type AgentConfig = z.infer<typeof agentConfigSchema>;

type Message = { id: string; sender: 'user' | 'agent'; text: string; files?: File[]; };
type ChatSession = { id: string; userId: string; title: string; messages: Message[]; agentConfig: AgentConfig | null; memoryUsage: number; framework: AgentFramework; };

// --- AXIOS INSTANCE ---
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// --- SKELETON LOADER COMPONENTS ---

const ChatUISkeleton = () => (
    <div className="flex h-screen w-full bg-[#0d1117] text-gray-200 font-sans">
        {/* Sidebar Skeleton */}
        <aside className="w-72 bg-[#161b22] p-4 flex flex-col border-r border-gray-700">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="flex-1 overflow-y-auto space-y-2">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Chat View Skeleton */}
        <div className="flex-1 flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                <Skeleton className="h-6 w-48" />
                <div className="w-1/3 space-y-2"><Skeleton className="h-2 w-24" /><Skeleton className="h-2 w-full" /></div>
            </header>
            <main className="flex-1 p-6">
                <div className="flex items-start gap-4 max-w-4xl mx-auto justify-start mb-6">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="p-4 rounded-xl max-w-[75%] bg-gray-700/50 w-2/3 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
                </div>
                <div className="flex items-start gap-4 max-w-4xl mx-auto justify-end">
                     <div className="p-4 rounded-xl max-w-[75%] bg-purple-900/20 w-1/2 space-y-2"><Skeleton className="h-4 w-full" /></div>
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                </div>
            </main>
            <footer className="p-4 border-t border-gray-700 bg-[#0d1117] flex-shrink-0">
                <div className="max-w-4xl mx-auto"><Skeleton className="h-12 w-full rounded-xl" /></div>
            </footer>
        </div>
    </div>
);

const MessageItemSkeleton = () => (
    <div className="flex items-start gap-4 max-w-4xl mx-auto justify-start">
        <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-gray-600"><Bot size={18} /></div>
        <div className="p-4 rounded-xl max-w-[75%] bg-gray-700 w-1/2 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    </div>
);

// --- MAIN CHAT UI COMPONENT ---
const MultiModalChatUI = () => {
  const { getToken, userId } = useAuth();

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(async (config) => { const token = await getToken(); if (token) { config.headers.Authorization = `Bearer ${token}`; } return config; }, (error) => Promise.reject(error));
    return () => { apiClient.interceptors.request.eject(requestInterceptor); };
  }, [getToken]);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionsLoaded, setIsSessionsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<'framework_selection' | 'chat'>('framework_selection');
  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (userId) {
        try {
          const response = await apiClient.get('/chat/sessions');
          if (response.data && response.data.length > 0) {
            setSessions(response.data);
            setActiveSessionId(response.data[0].id);
            setCurrentView('chat');
          }
        } catch (error) { console.error("Failed to fetch sessions:", error); }
        finally { setIsSessionsLoaded(true); }
      } else {
        setIsSessionsLoaded(true); // If no user, stop loading state
      }
    };
    if (!isSessionsLoaded) {
      fetchSessions();
    }
  }, [userId, isSessionsLoaded]);

  useEffect(() => {
    const saveSession = async () => { if (activeSession) { try { await apiClient.post('/chat/sessions', { session: activeSession }); } catch (error) { console.error("Failed to save session:", error); } } };
    const debounceSave = setTimeout(() => { if (isSessionsLoaded) { saveSession(); } }, 1000);
    return () => clearTimeout(debounceSave);
  }, [sessions, activeSession, isSessionsLoaded]);

  const createNewSession = (framework: AgentFramework) => {
    if (!userId) return;
    const newSession: ChatSession = { id: `session-${Date.now()}`, userId: userId, title: `New ${FRAMEWORK_DETAILS[framework].name} Chat`, agentConfig: null, messages: [], memoryUsage: 0, framework: framework };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentView('chat');
  };

  const updateSessionConfig = (config: AgentConfig) => {
    if (!activeSessionId) return;
    setSessions(sessions.map(s => s.id === activeSessionId ? { ...s, agentConfig: config } : s));
  };

  const addMessageToSession = async (message: Message) => {
    if (!activeSessionId || !activeSession?.agentConfig || !activeSession?.framework) return;
    setSessions(prev => prev.map(s => s.id !== activeSessionId ? s : { ...s, messages: [...s.messages, message] }));
    setIsLoading(true);
    try {
      const endpoint = activeSession.framework === 'langchain' ? '/chat/invoke' : '/llama-index-workflows/react-agent';
      const requestBody = activeSession.framework === 'langchain' ? { ...activeSession.agentConfig, message: message.text } : { openai_api_key: activeSession.agentConfig.api_key, message: message.text };
      const response = await apiClient.post(endpoint, requestBody);
      const agentResponse: Message = { id: `msg-agent-${Date.now()}`, sender: 'agent', text: response.data.response };
      setSessions(prev => prev.map(s => s.id !== activeSessionId ? s : { ...s, messages: [...s.messages, agentResponse] }));
    } catch (error) {
      let errorMessageText = 'An unknown error occurred.';
      if (axios.isAxiosError(error) && error.response) { errorMessageText = error.response.data.detail?.error || error.response.data.detail || 'Error from server.'; } else if (error instanceof Error) { errorMessageText = error.message; }
      const errorMessage: Message = { id: `msg-error-${Date.now()}`, sender: 'agent', text: `Error: ${errorMessageText}` };
      setSessions(prev => prev.map(s => s.id !== activeSessionId ? s : { ...s, messages: [...s.messages, errorMessage] }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSessionsLoaded && userId) {
    return <ChatUISkeleton />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-gray-200 font-sans">
      <SignedIn>
        <div className="absolute top-4 right-4 z-10"><UserButton afterSignOutUrl="/"/></div>
        {currentView === 'framework_selection' ? (<FrameworkSelectionScreen onSelectFramework={createNewSession} />) : (
          <>
            <ChatHistorySidebar sessions={sessions} activeSessionId={activeSessionId} onSelectSession={(id) => { setActiveSessionId(id); setCurrentView('chat'); }} onNewSession={() => setCurrentView('framework_selection')} />
            <div className="flex-1 flex flex-col">{activeSession ? (activeSession.agentConfig ? (<ChatView key={activeSession.id} session={activeSession} onSendMessage={addMessageToSession} isLoading={isLoading} />) : (<AgentConfigForm onSubmit={updateSessionConfig} />)) : (<WelcomeScreen onNewSession={() => setCurrentView('framework_selection')} />)}</div>
          </>
        )}
      </SignedIn>
      <SignedOut>
        <div className="w-full flex flex-col items-center justify-center"><h1 className="text-3xl font-bold mb-4">Welcome to the Agent Builder</h1><p className="text-gray-400 mb-8">Please sign in to continue</p><div className="bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 transition-colors"><SignInButton mode="modal" /></div></div>
      </SignedOut>
    </div>
  );
};

// --- Sub-component: FrameworkSelectionScreen ---
const FrameworkSelectionScreen = ({ onSelectFramework }: { onSelectFramework: (framework: AgentFramework) => void; }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <SectionReveal><h1 className="text-3xl font-bold mb-2">Choose Your Agentic Framework</h1></SectionReveal>
        <SectionReveal delay={0.1}><p className="text-gray-400 mb-12">Select the framework you want to build and chat with.</p></SectionReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {Object.entries(FRAMEWORK_DETAILS).map(([id, details], index) => (
                <SectionReveal key={id} delay={0.15 + index * 0.1}>
                    <button onClick={() => onSelectFramework(id as AgentFramework)} disabled={!details.enabled} className="p-6 bg-[#161b22] border border-gray-700 rounded-lg text-left hover:bg-gray-800 hover:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center text-center">
                        <NextImage src={details.logo} alt={`${details.name} Logo`} width={64} height={64} className="mb-4 rounded-full bg-white/10 p-2" />
                        <h2 className="text-xl font-semibold text-white mb-2">{details.name}</h2>
                        <p className="text-gray-400 text-sm">{details.description}</p>
                    </button>
                </SectionReveal>
            ))}
        </div>
    </div>
);

// --- Sub-component: Chat History Sidebar ---
const ChatHistorySidebar = ({ sessions, activeSessionId, onSelectSession, onNewSession }: { sessions: ChatSession[], activeSessionId: string | null, onSelectSession: (id: string) => void, onNewSession: () => void }) => (
    <aside className="w-72 bg-[#161b22] p-4 flex flex-col border-r border-gray-700">
        <button onClick={onNewSession} className="flex items-center justify-between w-full px-4 py-2 mb-4 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"> New Chat <Plus size={18} /> </button>
        <div className="flex-1 overflow-y-auto space-y-2">
            {sessions.map(session => (<div key={session.id} onClick={() => onSelectSession(session.id)} className={cn("flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors", activeSessionId === session.id ? "bg-gray-600" : "hover:bg-gray-700")}><NextImage src={FRAMEWORK_DETAILS[session.framework].logo} alt={`${FRAMEWORK_DETAILS[session.framework].name} Logo`} width={20} height={20} className="rounded-full"/><span className="text-sm truncate flex-1">{session.title}</span><button className="text-gray-500 hover:text-gray-300 p-1"><Trash2 size={14} /></button></div>))}
        </div>
    </aside>
);

// --- Sub-component: Agent Configuration Form ---
const AgentConfigForm = ({ onSubmit }: { onSubmit: (config: AgentConfig) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AgentConfig>({ resolver: zodResolver(agentConfigSchema), defaultValues: { api_key: "", model_name: "gpt-4o-mini", temperature: 0.7, top_p: 0.9, system_prompt: "You are a helpful AI assistant.", base_url: "", top_k: 40, }, });
  const onFormSubmit: SubmitHandler<AgentConfig> = data => onSubmit(data);
  const inputStyle = "mt-1 w-full bg-[#0d1117] border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none";
  const errorText = "text-red-400 text-xs mt-1";
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#0d1117]">
      <MagicCard className="w-full max-w-2xl rounded-lg" gradientFrom="#a855f7" gradientTo="#9333ea" gradientSize={400} gradientColor={"#262626"}>
        <div className="w-full bg-[#161b22] p-8 rounded-[7px]">
          <div className="flex items-center gap-3 mb-6"><Settings className="text-purple-400" /><h2 className="text-xl font-bold">Configure Your Agent</h2></div>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Model Name</label><input {...register('model_name')} className={inputStyle} placeholder="gpt-4o-mini" />{errors.model_name && <p className={errorText}>{errors.model_name.message}</p>}</div>
              <div><label className="text-sm font-medium">API Key</label><input type="password" {...register('api_key')} className={inputStyle} placeholder="sk-..." />{errors.api_key && <p className={errorText}>{errors.api_key.message}</p>}</div>
            </div>
            <div><label className="text-sm font-medium">Base URL (Optional)</label><input {...register('base_url')} className={inputStyle} placeholder="https://api.openai.com/v1" />{errors.base_url && <p className={errorText}>{errors.base_url.message}</p>}</div>
            <div><label className="text-sm font-medium">System Prompt</label><textarea {...register('system_prompt')} rows={3} className={`${inputStyle} resize-none`} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Temperature</label><input type="number" step="0.01" {...register('temperature', { valueAsNumber: true })} className={inputStyle} />{errors.temperature && <p className={errorText}>{errors.temperature.message}</p>}</div>
              <div><label className="text-sm font-medium">Top P</label><input type="number" step="0.01" {...register('top_p', { valueAsNumber: true })} className={inputStyle} />{errors.top_p && <p className={errorText}>{errors.top_p.message}</p>}</div>
              <div><label className="text-sm font-medium">Top K (Optional)</label><input type="number" {...register('top_k', { valueAsNumber: true })} className={inputStyle} />{errors.top_k && <p className={errorText}>{errors.top_k.message}</p>}</div>
            </div>
            <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Start Chat</button>
          </form>
        </div>
      </MagicCard>
    </div>
  );
};

// --- Sub-component: Main Chat View ---
const ChatView = ({ session, onSendMessage, isLoading }: { session: ChatSession; onSendMessage: (msg: Message) => void; isLoading: boolean; }) => {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [session.messages, isLoading]);
  useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; } }, [inputValue]);
  const handleSend = () => { if (!inputValue.trim() || isLoading) return; onSendMessage({ id: `msg-user-${Date.now()}`, sender: 'user', text: inputValue, files: attachedFiles }); setInputValue(''); setAttachedFiles([]); };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files) { setAttachedFiles(prev => [...prev, ...Array.from(event.target.files!)]); } };

  return (
    <div className="flex-1 flex flex-col max-h-full">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="font-semibold text-lg">{session.title}</h2>
        <div className="w-1/3"><label className="text-xs text-gray-400">Memory Usage</label><div className="w-full bg-gray-700 rounded-full h-2.5 mt-1"><div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${session.memoryUsage}%` }}></div></div></div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {session.messages.map(msg => (<MessageItem key={msg.id} message={msg} />))}
          {isLoading && <MessageItemSkeleton />}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 border-t border-gray-700 bg-[#0d1117] flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {attachedFiles.length > 0 && (<div className="mb-2 p-2 bg-[#161b22] rounded-md flex flex-wrap gap-2">{attachedFiles.map((file, i) => <FilePreview key={i} file={file} onRemove={() => setAttachedFiles(files => files.filter(f => f !== file))} />)}</div>)}
          <div className="relative flex items-end">
            <textarea ref={textareaRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={isLoading ? "Agent is responding..." : "Ask anything..."} className="w-full bg-[#161b22] border border-gray-600 rounded-xl py-3 pl-4 pr-28 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none max-h-48" rows={1} disabled={isLoading} />
            <div className="absolute right-4 bottom-3 flex items-center gap-2"><input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" /><button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" disabled={isLoading}><Paperclip size={20} /></button><button onClick={handleSend} className="p-2 bg-purple-600 rounded-full text-white disabled:bg-gray-500" disabled={!inputValue.trim() || isLoading}><SendHorizonal size={20} /></button></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Helper Component: MessageItem ---
const MessageItem = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={cn("flex items-start gap-4 max-w-4xl mx-auto", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (<div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-gray-600"><Bot size={18} /></div>)}
      <div className={cn("p-4 rounded-xl max-w-[75%]", isUser ? 'bg-purple-900/50' : 'bg-gray-700')}>
        {isUser ? (<p className="text-white/90 whitespace-pre-wrap">{message.text}</p>) : (<div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code(props) { const { children, className, ...rest } = props; const match = /language-(\w+)/.exec(className || ''); return match ? (<div className="bg-gray-800 rounded-md my-2"><div className="flex items-center justify-between px-4 py-1 bg-gray-900 text-xs text-gray-400 rounded-t-md"><span>{match[1]}</span><button onClick={() => navigator.clipboard.writeText(String(children))} className="hover:text-white">Copy</button></div><pre className="p-4 overflow-x-auto text-sm"><code {...rest} className={className}>{children}</code></pre></div>) : ( <code {...rest} className="bg-gray-800 rounded-sm px-1 py-0.5 text-purple-300 font-mono text-sm">{children}</code> ); } }}>{message.text}</ReactMarkdown></div>)}
        {message.files && message.files.length > 0 && (<div className="mt-3 flex flex-wrap gap-2">{message.files.map((file, i) => <FilePreview key={i} file={file} isReadOnly />)}</div>)}
      </div>
      {isUser && (<div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-purple-600"><User size={18} /></div>)}
    </div>
  );
};

// --- Other Helper Components ---
const FilePreview = ({ file, onRemove, isReadOnly = false }: { file: File; onRemove?: () => void; isReadOnly?: boolean; }) => {
  const getIcon = () => { if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-purple-400" />; if (file.type.startsWith('video/')) return <Video className="h-5 w-5 text-blue-400" />; return <FileText className="h-5 w-5 text-gray-400" />; };
  return (
    <div className="flex items-center gap-2 bg-[#0d1117] border border-gray-600 rounded-md p-1.5 text-xs">
      {getIcon()}<span className="truncate max-w-32">{file.name}</span>
      {!isReadOnly && <button onClick={onRemove} className="text-gray-500 hover:text-white"><X size={14} /></button>}
    </div>
  );
};

const WelcomeScreen = ({ onNewSession }: { onNewSession: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8"><Bot size={48} className="text-gray-600 mb-4" /><h2 className="text-2xl font-semibold mb-2">Agent Development Environment</h2><p className="text-gray-400 mb-6 max-w-md">Start a new conversation or select an existing one from the sidebar.</p><button onClick={onNewSession} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors">Start New Chat</button></div>
);

export default MultiModalChatUI;