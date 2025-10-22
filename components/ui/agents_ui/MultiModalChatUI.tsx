'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NextImage from 'next/image';
import { useAuth, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  SendHorizonal, Bot, User, Trash2, Paperclip, X, Image as ImageIcon, Video, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { AgentState, ToolConfig, ToolParam } from './AgentBuild';

// --- FRAMEWORK CONFIGURATION ---
const FRAMEWORK_DETAILS = {
  langchain: { name: 'LangChain Agent', description: 'Use the powerful and flexible LangChain agent framework.', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png', enabled: true },
  llama_index: { name: 'LlamaIndex Workflow', description: 'Build with LlamaIndex\'s event-driven ReAct agent.', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/llamaindex-color.png', enabled: true },
  adk: { name: 'Google ADK', description: 'Explore Google\'s Agent Development Kit with ReAct planning.', logo: 'https://google.github.io/adk-docs/assets/agent-development-kit.png', enabled: true },
  pydantic_ai: { name: 'Pydantic AI', description: 'Leverage Pydantic for structured AI outputs (coming soon).', logo: 'https://pbs.twimg.com/profile_images/1884966723746435073/x0p8ngPD_400x400.jpg', enabled: false },
  langgraph: { name: 'LangGraph', description: 'Build stateful, multi-actor applications (coming soon).', logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langgraph-color.png', enabled: false }
};
type AgentFramework = keyof typeof FRAMEWORK_DETAILS;

// --- TYPES ---
interface BackendToolFormat {
  name: string;
  description: string;
  api_url: string;
  api_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  api_headers: Record<string, string>;
  api_query_params: Record<string, string>;
  api_path_params: Record<string, string>;
  request_payload: string;
}

interface AgentConfig {
  api_key: string;
  model_name: string;
  temperature: number;
  top_p: number;
  top_k?: number | null;
  system_prompt?: string;
  base_url?: string;
  provider_id?: string;
  tools?: ToolConfig[];
}

type Message = { id: string; sender: 'user' | 'agent'; text: string; files?: File[]; };
type ChatSession = { id: string; userId: string; title: string; messages: Message[]; agentConfig: AgentConfig | null; memoryUsage: number; framework: AgentFramework; agentId: string; };

interface BackendSessionData {
  id: string; user_id: string; title: string; messages: Message[];
  agent_config: AgentConfig; memory_usage: number; framework: AgentFramework; agent_id?: string;
}

// --- UTILITY FUNCTION TO TRANSFORM TOOLS ---
const transformToolsForBackend = (tools: ToolConfig[]): BackendToolFormat[] => {
  const paramReducer = (acc: Record<string, string>, param: ToolParam) => {
    if (param.key && param.value) acc[param.key] = param.value;
    return acc;
  };
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    api_url: tool.api_url,
    api_method: tool.api_method,
    api_headers: (tool.api_headers || []).reduce(paramReducer, {}),
    api_query_params: (tool.api_query_params || []).reduce(paramReducer, {}),
    api_path_params: (tool.api_path_params || []).reduce(paramReducer, {}),
    request_payload: tool.request_payload || ""
  }));
};

const ChatUISkeleton = () => (
  <div className="flex h-screen w-full bg-[#0d1117] text-gray-200 font-sans">
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
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <Skeleton className="h-6 w-48" />
        <div className="w-1/3 space-y-2">
          <Skeleton className="h-2 w-24" />
          <Skeleton className="h-2 w-full" />
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="flex items-start gap-4 max-w-4xl mx-auto justify-start mb-6">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="p-4 rounded-xl max-w-[75%] bg-gray-700/50 w-2/3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        <div className="flex items-start gap-4 max-w-4xl mx-auto justify-end">
          <div className="p-4 rounded-xl max-w-[75%] bg-purple-900/20 w-1/2 space-y-2">
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        </div>
      </main>
      <footer className="p-4 border-t border-gray-700 bg-[#0d1117] flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </footer>
    </div>
  </div>
);

const MessageItemSkeleton = () => (
  <div className="flex items-start gap-4 max-w-4xl mx-auto justify-start">
    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-gray-600">
      <Bot size={18} />
    </div>
    <div className="p-4 rounded-xl max-w-[75%] bg-gray-700 w-1/2 space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

// --- MAIN CHAT UI COMPONENT ---
const MultiModalChatUI = ({
  initialAgentConfig,
}: {
  initialAgentConfig?: AgentState | null;
}) => {
  const { userId, getToken } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionsLoaded, setIsSessionsLoaded] = useState(false);
  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);
  const initialSessionCreated = useRef(false);

  useEffect(() => {
    const createInitialSession = async () => {
      if (initialAgentConfig && userId && !initialSessionCreated.current) {
        initialSessionCreated.current = true;
        const framework = initialAgentConfig.framework as AgentFramework;
        if (!framework) return;

        const getProviderName = (providerId: string) => ['openai', 'groq', 'mistral', 'cerebras', 'sambanova', 'nvidia'].includes(providerId) ? providerId : 'groq';

        const newAgentConfigForState: AgentConfig = {
          api_key: initialAgentConfig.settings.apiKey || '',
          model_name: initialAgentConfig.settings.modelName || 'llama-3.1-70b-versatile',
          temperature: initialAgentConfig.settings.temperature ?? 0.7,
          top_p: 0.9, top_k: null,
          system_prompt: initialAgentConfig.settings.systemPrompt || 'You are a helpful AI assistant.',
          base_url: initialAgentConfig.settings.baseUrl || '',
          provider_id: getProviderName(initialAgentConfig.settings.providerId || 'groq'),
          tools: initialAgentConfig.tools || [],
        };

        const agentConfigForBackend = { ...newAgentConfigForState, tools: transformToolsForBackend(newAgentConfigForState.tools || []) };

        try {
          const token = await getToken();
          if (!token) throw new Error('No auth token');
          
          const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://cortex-l8hf.onrender.com'}/api/v1/sessions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ framework, title: `New ${FRAMEWORK_DETAILS[framework]?.name || 'Agent'} Chat`, agent_config: agentConfigForBackend }),
          });

          if (!sessionResponse.ok) throw new Error(`Failed to create session: ${sessionResponse.statusText}`);
          
          const createdSession = await sessionResponse.json();
          const newSession: ChatSession = {
            id: createdSession.id, userId: createdSession.user_id, title: createdSession.title,
            messages: createdSession.messages || [], agentConfig: newAgentConfigForState,
            memoryUsage: createdSession.memory_usage || 0, framework: createdSession.framework,
            agentId: createdSession.agent_id || '',
          };
          setSessions(prev => [newSession, ...prev]);
          setActiveSessionId(newSession.id);
        } catch (error) {
          console.error('Failed to create session:', error);
        } finally {
          setIsSessionsLoaded(true);
        }
      }
    };

    const fetchSessions = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No auth token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://cortex-l8hf.onrender.com'}/api/v1/sessions/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error(`Failed to fetch sessions: ${response.statusText}`);
        
        const data = await response.json();
        if (data.sessions && data.sessions.length > 0) {
          const frontendSessions: ChatSession[] = data.sessions.map((session: BackendSessionData) => ({
            id: session.id, userId: session.user_id, title: session.title, messages: session.messages || [],
            agentConfig: session.agent_config || null, memoryUsage: session.memory_usage || 0,
            framework: session.framework, agentId: session.agent_id || '',
          }));
          setSessions(frontendSessions);
          setActiveSessionId(frontendSessions[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setIsSessionsLoaded(true);
      }
    };

    // <<< FIX: This logic prevents the infinite loop >>>
    if (initialAgentConfig && userId && !initialSessionCreated.current) {
      createInitialSession();
    } else if (!initialAgentConfig && userId && !isSessionsLoaded) {
      fetchSessions();
    }
  }, [userId, isSessionsLoaded, initialAgentConfig, getToken]);


  const addMessageToSession = async (message: Message) => {
    if (!activeSessionId || !activeSession?.agentConfig || !activeSession?.framework) return;
    
    setSessions(prev => prev.map(s => s.id !== activeSessionId ? s : { ...s, messages: [...s.messages, message] }));
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token available');
  
      const frameworkEndpoints: Record<AgentFramework, string> = {
        langchain: '/api/v1/ReActAgent/langchain',
        llama_index: '/api/v1/ReActAgent/llama_index',
        adk: '/api/v1/ReActAgent/adk',
        pydantic_ai: '/api/v1/ReActAgent/pydantic_ai',
        langgraph: '/api/v1/ReActAgent/langgraph',
      };
      const endpoint = frameworkEndpoints[activeSession.framework] || frameworkEndpoints.langchain;
      
       const backendTools = transformToolsForBackend(activeSession.agentConfig.tools || []);
       const requestBody = { 
         ...activeSession.agentConfig, 
         message: message.text, 
         tools: backendTools,
         provider_id: activeSession.agentConfig.provider_id || 'groq',
         model_id: activeSession.agentConfig.model_name
       };
       if (!requestBody.api_key) throw new Error('API key is required.');
       
       const providerId = requestBody.provider_id || 'groq';
       if (providerId === 'openai' && !requestBody.api_key.startsWith('sk-')) throw new Error('Invalid OpenAI API key format.');
       if (providerId === 'groq' && !requestBody.api_key.startsWith('gsk_')) throw new Error('Invalid Groq API key format.');
       if (providerId === 'sambanova' && !requestBody.api_key.startsWith('sk-')) throw new Error('Invalid SambaNova API key format.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://cortex-l8hf.onrender.com'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      const responseData = await response.json();
      const agentResponse: Message = { id: `msg-agent-${Date.now()}`, sender: 'agent', text: responseData.response };
      setSessions(prev => prev.map(s => s.id !== activeSessionId ? s : { ...s, messages: [...s.messages, agentResponse] }));
    } catch (error) {
      let errorMessageText = 'An unknown error occurred.';
      if (error instanceof Error) errorMessageText = error.message;
      const errorMessage: Message = { id: `msg-error-${Date.now()}`, sender: 'agent', text: `Error: ${errorMessageText}` };
      setSessions(prev => prev.map(s => s.id !== activeSessionId ? s : { ...s, messages: [...s.messages, errorMessage] }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSessionsLoaded && userId) return <ChatUISkeleton />;
  
  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-gray-200 font-sans">
      <SignedIn>
        <div className="absolute top-4 right-4 z-10">
          <UserButton afterSignOutUrl="/" />
        </div>
        <>
          <ChatHistorySidebar sessions={sessions} activeSessionId={activeSessionId} onSelectSession={(id) => setActiveSessionId(id)} />
          <div className="flex-1 flex flex-col">
            {activeSession ? (
              <ChatView key={activeSession.id} session={activeSession} onSendMessage={addMessageToSession} isLoading={isLoading} />
            ) : (
              <WelcomeScreen />
            )}
          </div>
        </>
      </SignedIn>
      <SignedOut>
        <div className="w-full flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to the Agent Builder</h1>
          <p className="text-gray-400 mb-8">Please sign in to continue</p>
          <div className="bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 transition-colors">
            <SignInButton mode="modal" />
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const ChatHistorySidebar = ({ sessions, activeSessionId, onSelectSession }: { sessions: ChatSession[], activeSessionId: string | null, onSelectSession: (id: string) => void }) => (
  <aside className="w-72 bg-[#161b22] p-4 flex flex-col border-r border-gray-700">
    <div className="flex-1 overflow-y-auto space-y-2">
      {sessions.map(session => (
        <div key={session.id} onClick={() => onSelectSession(session.id)} className={cn("flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors", activeSessionId === session.id ? "bg-gray-600" : "hover:bg-gray-700")}>
          <NextImage src={FRAMEWORK_DETAILS[session.framework].logo} alt={`${FRAMEWORK_DETAILS[session.framework].name} Logo`} width={20} height={20} className="rounded-full" />
          <span className="text-sm truncate flex-1">{session.title}</span>
          <button className="text-gray-500 hover:text-gray-300 p-1"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  </aside>
);

const ChatView = ({ session, onSendMessage, isLoading }: { session: ChatSession; onSendMessage: (msg: Message) => void; isLoading: boolean; }) => {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [session.messages, isLoading]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage({ id: `msg-user-${Date.now()}`, sender: 'user', text: inputValue, files: attachedFiles });
    setInputValue('');
    setAttachedFiles([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-h-full">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="font-semibold text-lg">{session.title}</h2>
        <div className="w-1/3">
          <label className="text-xs text-gray-400">Memory Usage</label>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${session.memoryUsage}%` }}></div>
          </div>
        </div>
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
          {attachedFiles.length > 0 && (
            <div className="mb-2 p-2 bg-[#161b22] rounded-md flex flex-wrap gap-2">
              {attachedFiles.map((file, i) => <FilePreview key={i} file={file} onRemove={() => setAttachedFiles(files => files.filter(f => f !== file))} />)}
            </div>
          )}
          <div className="relative flex items-end">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isLoading ? "Agent is responding..." : "Ask anything..."}
              className="w-full bg-[#161b22] border border-gray-600 rounded-xl py-3 pl-4 pr-28 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none max-h-48"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-4 bottom-3 flex items-center gap-2">
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" disabled={isLoading}><Paperclip size={20} /></button>
              <button onClick={handleSend} className="p-2 bg-purple-600 rounded-full text-white disabled:bg-gray-500" disabled={!inputValue.trim() || isLoading}><SendHorizonal size={20} /></button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const MessageItem = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={cn("flex items-start gap-4 max-w-4xl mx-auto", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-gray-600">
          <Bot size={18} />
        </div>
      )}
      <div className={cn("p-4 rounded-xl max-w-[75%]", isUser ? 'bg-purple-900/50' : 'bg-gray-700')}>
        {isUser ? (
          <p className="text-white/90 whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <div className="bg-gray-800 rounded-md my-2">
                      <div className="flex items-center justify-between px-4 py-1 bg-gray-900 text-xs text-gray-400 rounded-t-md">
                        <span>{match[1]}</span>
                        <button onClick={() => navigator.clipboard.writeText(String(children))} className="hover:text-white">Copy</button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-sm"><code {...rest} className={className}>{children}</code></pre>
                    </div>
                  ) : (
                    <code {...rest} className="bg-gray-800 rounded-sm px-1 py-0.5 text-purple-300 font-mono text-sm">{children}</code>
                  );
                }
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}
        {message.files && message.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.files.map((file, i) => <FilePreview key={i} file={file} isReadOnly />)}
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-purple-600">
          <User size={18} />
        </div>
      )}
    </div>
  );
};

const FilePreview = ({ file, onRemove, isReadOnly = false }: { file: File; onRemove?: () => void; isReadOnly?: boolean; }) => {
  const getIcon = () => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-purple-400" />;
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5 text-blue-400" />;
    return <FileText className="h-5 w-5 text-gray-400" />;
  };
  return (
    <div className="flex items-center gap-2 bg-[#0d1117] border border-gray-600 rounded-md p-1.5 text-xs">
      {getIcon()}
      <span className="truncate max-w-32">{file.name}</span>
      {!isReadOnly && <button onClick={onRemove} className="text-gray-500 hover:text-white"><X size={14} /></button>}
    </div>
  );
};

const WelcomeScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
    <Bot size={48} className="text-gray-600 mb-4" />
    <h2 className="text-2xl font-semibold mb-2">No Active Chats</h2>
    <p className="text-gray-400 mb-6 max-w-md">
      Create a new agent from the main dashboard to start a conversation.
    </p>
  </div>
);

export default MultiModalChatUI;