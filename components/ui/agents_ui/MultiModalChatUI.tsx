'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NextImage from 'next/image';
import {
  useAuth,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs';
import {
  SendHorizonal,
  Bot,
  User,
  Trash2,
  Paperclip,
  X,
  Image as ImageIcon,
  Video,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { AgentState, ToolConfig, ToolParam } from './AgentBuild';

// ====================================================================
// FRAMEWORK CONFIGURATION & TYPES
// ====================================================================

const FRAMEWORK_DETAILS = {
  langchain: {
    name: 'LangChain Agent',
    description: 'Use the powerful and flexible LangChain agent framework.',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png',
    enabled: true,
  },
  llama_index: {
    name: 'LlamaIndex Workflow',
    description: "Build with LlamaIndex's event-driven ReAct agent.",
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/llamaindex-color.png',
    enabled: true,
  },
  adk: {
    name: 'Google ADK',
    description:
      "Explore Google's Agent Development Kit with ReAct planning.",
    logo: 'https://google.github.io/adk-docs/assets/agent-development-kit.png',
    enabled: true,
  },
  pydantic_ai: {
    name: 'Pydantic AI',
    description: 'Leverage Pydantic for structured AI outputs (coming soon).',
    logo: 'https://pbs.twimg.com/profile_images/1884966723746435073/x0p8ngPD_400x400.jpg',
    enabled: false,
  },
  langgraph: {
    name: 'LangGraph',
    description: 'Build stateful, multi-actor applications (coming soon).',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langgraph-color.png',
    enabled: false,
  },
};

type AgentFramework = keyof typeof FRAMEWORK_DETAILS;

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

// ====================================================================
// TYPES
// ====================================================================

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

type Message = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  files?: File[];
};

type ChatSession = {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  agentConfig: AgentConfig | null;
  memoryUsage: number;
  framework: AgentFramework;
  agentId: string;
};

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

const transformToolsForBackend = (tools: ToolConfig[]): BackendToolFormat[] => {
  const paramReducer = (acc: Record<string, string>, param: ToolParam) => {
    if (param.key && param.value) acc[param.key] = param.value;
    return acc;
  };

  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    api_url: tool.api_url,
    api_method: tool.api_method,
    api_headers: (tool.api_headers || []).reduce(paramReducer, {}),
    api_query_params: (tool.api_query_params || []).reduce(paramReducer, {}),
    api_path_params: (tool.api_path_params || []).reduce(paramReducer, {}),
    request_payload: tool.request_payload || '',
  }));
};

// ====================================================================
// SKELETON COMPONENTS
// ====================================================================

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

// ====================================================================
// MAIN COMPONENT: MultiModalChatUI
// ====================================================================

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

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  );

  const initialSessionCreated = useRef(false);

  useEffect(() => {
    const createInitialSession = async () => {
      /* ... unchanged ... */
    };
    const fetchSessions = async () => {
      /* ... unchanged ... */
    };
    if (initialAgentConfig && userId && !initialSessionCreated.current)
      createInitialSession();
    else if (!initialAgentConfig && !isSessionsLoaded) fetchSessions();
  }, [userId, isSessionsLoaded, initialAgentConfig, getToken]);

  const addMessageToSession = async (message: Message) => {
    if (!activeSessionId || !activeSession?.agentConfig || !activeSession?.framework) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id !== activeSessionId
          ? s
          : { ...s, messages: [...s.messages, message] },
      ),
    );
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

      const endpoint =
        frameworkEndpoints[activeSession.framework] || frameworkEndpoints.langchain;

      const backendTools = transformToolsForBackend(
        activeSession.agentConfig.tools || [],
      );

      const requestBody = {
        ...activeSession.agentConfig,
        message: message.text,
        tools: backendTools,
        provider_id: activeSession.agentConfig.provider_id || 'groq',
        model_id: activeSession.agentConfig.model_name,
      };

      console.log('✅ Sending request:', requestBody);

      if (!requestBody.api_key) throw new Error('API key is required.');

      const providerId = requestBody.provider_id || 'groq';
      if (providerId === 'openai' && !requestBody.api_key.startsWith('sk-'))
        throw new Error('Invalid OpenAI API key format.');
      if (providerId === 'groq' && !requestBody.api_key.startsWith('gsk_'))
        throw new Error('Invalid Groq API key format.');
      if (providerId === 'sambanova' && !requestBody.api_key.startsWith('sk-'))
        throw new Error('Invalid SambaNova API key format.');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://cortex-l8hf.onrender.com'}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorBody}`);
      }

      const responseData = await response.json();
      const agentResponse: Message = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        text: responseData.response,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id !== activeSessionId
            ? s
            : { ...s, messages: [...s.messages, agentResponse] },
        ),
      );
    } catch (error) {
      const errorMessageText =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      const errorMessage: Message = {
        id: `msg-error-${Date.now()}`,
        sender: 'agent',
        text: `Error: ${errorMessageText}`,
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id !== activeSessionId
            ? s
            : { ...s, messages: [...s.messages, errorMessage] },
        ),
      );
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
          <ChatHistorySidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => setActiveSessionId(id)}
          />
          <div className="flex-1 flex flex-col">
            {activeSession ? (
              <ChatView
                key={activeSession.id}
                session={activeSession}
                onSendMessage={addMessageToSession}
                isLoading={isLoading}
              />
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


export default MultiModalChatUI;
