// components/ui/AgentDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/shadcn/dialog';
import { Input } from '@/components/ui/shadcn/Input';
import { Label } from '@/components/ui/shadcn/label';
import { 
  Bot, 
  MessageSquare, 
  Trash2, 
  Plus, 
  Calendar,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Agent {
  id: string; // This will be the AgentId from the backend
  name: string;
  description?: string;
  architecture: string;
  framework: string;
  settings: Record<string, unknown>;
  tools?: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
  session_count: number;
}

interface AgentDashboardProps {
  onCreateAgent: () => void;
  onSelectAgent: (agentId: string) => void;
}

export default function AgentDashboard({ onCreateAgent, onSelectAgent }: AgentDashboardProps) {
  const { isSignedIn } = useUser();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchAgents();
    }
  }, [isSignedIn]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmText !== 'delete' || !agentToDelete) return;

    try {
      const response = await fetch(`/api/agents/${agentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAgents(agents.filter(agent => agent.id !== agentToDelete.id));
        setDeleteDialogOpen(false);
        setDeleteConfirmText('');
        setAgentToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const getFrameworkDisplayName = (framework: string) => {
    const frameworkNames: { [key: string]: string } = {
      'langchain': 'LangChain',
      'crewai': 'CrewAI',
      'autogen': 'Autogen',
      'llama_index': 'LlamaIndex',
      'langgraph': 'LangGraph',
      'adk': 'Google ADK',
      'pydantic_ai': 'Pydantic AI',
    };
    return frameworkNames[framework] || framework;
  };

  const getArchitectureColor = (architecture: string) => {
    return architecture === 'mono' ? 'bg-blue-500' : 'bg-purple-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Agents</h1>
          <p className="text-white/70">Manage and interact with your AI agents</p>
        </div>
        <Button onClick={onCreateAgent} className="bg-purple-600 hover:bg-purple-500">
          <Plus className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No agents yet</h3>
          <p className="text-white/70 mb-6">Create your first AI agent to get started</p>
          <Button onClick={onCreateAgent} className="bg-purple-600 hover:bg-purple-500">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Agent
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-black/30 border-white/15 hover:border-purple-500/50 transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-3 h-3 rounded-full", getArchitectureColor(agent.architecture))} />
                      <CardTitle className="text-white group-hover:text-purple-300 transition-colors">
                        {agent.name}
                      </CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => onSelectAgent(agent.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-900/20"
                        onClick={() => handleDeleteAgent(agent)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-white/70">
                    {agent.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {getFrameworkDisplayName(agent.framework)}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {agent.architecture}-agent
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-white/60">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{agent.session_count} conversations</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-white/60">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Created {new Date(agent.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {agent.tools && agent.tools.length > 0 && (
                      <div className="flex items-center text-sm text-white/60">
                        <Settings className="h-4 w-4 mr-1" />
                        <span>{agent.tools.length} tools configured</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Button 
                      onClick={() => onSelectAgent(agent.id)}
                      className="w-full bg-purple-600 hover:bg-purple-500"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black/90 border-white/15">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              Delete Agent
            </DialogTitle>
            <DialogDescription className="text-white/70">
              This action cannot be undone. This will permanently delete the agent 
              &quot;{agentToDelete?.name}&quot; and all its conversations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="delete-confirm" className="text-white">
              Type &quot;delete&quot; to confirm:
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mt-2 bg-black/50 border-white/15 text-white"
              placeholder="Type &apos;delete&apos; here"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmText('');
                setAgentToDelete(null);
              }}
              className="border-white/15 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteConfirmText !== 'delete'}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
