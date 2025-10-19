'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  MessageSquare, 
  Calendar, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Skeleton } from '@/components/ui/shadcn/skeleton';

// Types
interface Agent {
  id: string;
  name: string;
  description: string;
  architecture: string;
  framework: string;
  settings: Record<string, unknown>;
  tools: Record<string, unknown>[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  session_count: number;
}

interface AgentListProps {
  onAgentSelect: (agent: Agent) => void;
  onAgentEdit?: (agent: Agent) => void;
  onCreateNew: () => void;
  showHeader?: boolean;
}

// Skeleton component for loading state
const AgentCardSkeleton = () => (
  <div className="rounded-xl border border-white/15 bg-black/30 p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

// Individual agent card component
const AgentCard = ({ 
  agent, 
  onSelect, 
  onEdit,
  onDelete 
}: { 
  agent: Agent; 
  onSelect: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onDelete: (agentId: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(agent);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onDelete(agent.id);
      } else {
        console.error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-xl border border-white/15 bg-black/30 p-6 hover:bg-black/40 transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect(agent)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-white/60 capitalize">
              {agent.architecture} • {agent.framework}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="text-white/40 hover:text-purple-400 hover:bg-purple-900/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-white/40 hover:text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {agent.description && (
        <p className="text-sm text-white/70 mb-4 line-clamp-2">
          {agent.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-white/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{agent.session_count} sessions</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(agent.created_at)}</span>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-500 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(agent);
          }}
        >
          <Play className="h-4 w-4 mr-1" />
          Chat
        </Button>
      </div>
    </motion.div>
  );
};

// Pagination component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void; 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-black/30 border-white/15 text-white hover:bg-white/5"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={
                currentPage === page
                  ? "bg-purple-600 hover:bg-purple-500 text-white"
                  : "bg-black/30 border-white/15 text-white hover:bg-white/5"
              }
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-black/30 border-white/15 text-white hover:bg-white/5"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Main AgentList component
export default function AgentList({ onAgentSelect, onAgentEdit, onCreateNew, showHeader = true }: AgentListProps) {
  const { getToken } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/agents?page=${page}&limit=6`);

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }

      const data = await response.json();
      setAgents(data);
      
      // For now, we'll calculate total pages based on a reasonable assumption
      // In a real implementation, the API should return pagination metadata
      setTotalPages(Math.ceil(data.length / 6) || 1);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAgents(page);
  };

  useEffect(() => {
    fetchAgents(currentPage);
  }, [currentPage, fetchAgents]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Failed to load agents</div>
        <Button onClick={() => fetchAgents(currentPage)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Agents</h2>
            <p className="text-white/60 mt-1">
              Manage and interact with your configured AI agents
            </p>
          </div>
          <Button
            onClick={onCreateNew}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            <Bot className="h-4 w-4 mr-2" />
            Create New Agent
          </Button>
        </div>
      )}

      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Agents Yet</h3>
          <p className="text-white/60 mb-6">
            Create your first AI agent to get started
          </p>
          <Button
            onClick={onCreateNew}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            <Bot className="h-4 w-4 mr-2" />
            Create Your First Agent
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={onAgentSelect}
                  onEdit={onAgentEdit}
                  onDelete={handleDeleteAgent}
                />
              ))}
            </AnimatePresence>
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
