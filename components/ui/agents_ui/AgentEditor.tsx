// components/ui/agents_ui/AgentEditor.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/Input';
import { Label } from '@/components/ui/shadcn/label';
import ProviderSelector from './ProviderSelector';
import { ArrowLeft, Save, PlusCircle, Trash2 } from 'lucide-react';

// Types
interface ToolParam {
  id: string;
  key: string;
  value: string;
}

interface ToolConfig {
  id: string;
  name: string;
  description: string;
  api_url: string;
  api_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  api_headers: ToolParam[];
  api_query_params: ToolParam[];
  api_path_params: ToolParam[];
  request_payload: string;
}

interface ConfigFormData {
  apiKey: string;
  modelName: string;
  temperature: number;
  systemPrompt: string;
  providerId: string;
  modelId: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  architecture: string;
  framework: string;
  settings: Record<string, unknown>;
  tools: Record<string, unknown>[];
}

interface AgentEditorProps {
  agent: Agent;
  onSave: (updatedAgent: Agent) => void;
  onCancel: () => void;
}

export default function AgentEditor({ agent, onSave, onCancel }: AgentEditorProps) {
  const [agentName, setAgentName] = useState(agent.name);
  const [agentDescription, setAgentDescription] = useState(agent.description);
  const [settings, setSettings] = useState<Partial<ConfigFormData>>({
    apiKey: (agent.settings.apiKey as string) || '',
    modelName: (agent.settings.modelName as string) || '',
    temperature: (agent.settings.temperature as number) || 0.7,
    systemPrompt: (agent.settings.systemPrompt as string) || 'You are a helpful AI assistant.',
    providerId: (agent.settings.providerId as string) || 'groq',
    modelId: (agent.settings.modelId as string) || '',
  });

  // Convert agent tools to frontend format
  const [tools, setTools] = useState<ToolConfig[]>(() => {
    if (!agent.tools || agent.tools.length === 0) {
      return [{
        id: `tool-${Date.now()}`,
        name: '',
        description: '',
        api_url: '',
        api_method: 'GET',
        api_headers: [],
        api_query_params: [],
        api_path_params: [],
        request_payload: ''
      }];
    }

    return agent.tools.map((tool: Record<string, unknown>, index: number) => {
      // Convert dict headers back to ToolParam array
      const headersDict = (tool.api_headers as Record<string, string>) || {};
      const headers: ToolParam[] = Object.entries(headersDict).map(([key, value], i) => ({
        id: `header-${index}-${i}`,
        key,
        value
      }));

      const queryDict = (tool.api_query_params as Record<string, string>) || {};
      const queryParams: ToolParam[] = Object.entries(queryDict).map(([key, value], i) => ({
        id: `query-${index}-${i}`,
        key,
        value
      }));

      const pathDict = (tool.api_path_params as Record<string, string>) || {};
      const pathParams: ToolParam[] = Object.entries(pathDict).map(([key, value], i) => ({
        id: `path-${index}-${i}`,
        key,
        value
      }));

      return {
        id: `tool-${index}`,
        name: (tool.name as string) || '',
        description: (tool.description as string) || '',
        api_url: (tool.api_url as string) || '',
        api_method: (tool.api_method as 'GET' | 'POST' | 'PUT' | 'DELETE') || 'GET',
        api_headers: headers,
        api_query_params: queryParams,
        api_path_params: pathParams,
        request_payload: (tool.request_payload as string) || ''
      };
    });
  });

  const { register, handleSubmit, setValue, watch } = useForm<ConfigFormData>({
    defaultValues: settings
  });

  const handleProviderChange = (providerId: string) => {
    setValue('providerId', providerId);
    setSettings(prev => ({ ...prev, providerId }));
  };

  const handleModelChange = (modelId: string) => {
    setValue('modelId', modelId);
    setSettings(prev => ({ ...prev, modelId, modelName: modelId }));
  };

  // Tool management functions
  const addTool = () => {
    setTools([...tools, {
      id: `tool-${Date.now()}`,
      name: '',
      description: '',
      api_url: '',
      api_method: 'GET',
      api_headers: [],
      api_query_params: [],
      api_path_params: [],
      request_payload: ''
    }]);
  };

  const removeTool = (toolId: string) => {
    setTools(tools.filter(t => t.id !== toolId));
  };

  const updateToolField = <K extends keyof ToolConfig>(toolId: string, field: K, value: ToolConfig[K]) => {
    setTools(tools.map(tool => 
      tool.id === toolId ? { ...tool, [field]: value } : tool
    ));
  };

  const addParam = (toolId: string, paramType: 'api_headers' | 'api_query_params' | 'api_path_params') => {
    setTools(tools.map(tool => {
      if (tool.id === toolId) {
        return {
          ...tool,
          [paramType]: [...tool[paramType], { id: `${paramType}-${Date.now()}`, key: '', value: '' }]
        };
      }
      return tool;
    }));
  };

  const removeParam = (toolId: string, paramType: 'api_headers' | 'api_query_params' | 'api_path_params', paramId: string) => {
    setTools(tools.map(tool => {
      if (tool.id === toolId) {
        return {
          ...tool,
          [paramType]: tool[paramType].filter(p => p.id !== paramId)
        };
      }
      return tool;
    }));
  };

  const updateParam = (toolId: string, paramType: 'api_headers' | 'api_query_params' | 'api_path_params', paramId: string, field: 'key' | 'value', value: string) => {
    setTools(tools.map(tool => {
      if (tool.id === toolId) {
        return {
          ...tool,
          [paramType]: tool[paramType].map(p => 
            p.id === paramId ? { ...p, [field]: value } : p
          )
        };
      }
      return tool;
    }));
  };

  const handleSave = async () => {
    // Transform tools to backend format
    const transformedTools = tools.map(tool => {
      const headers: Record<string, string> = {};
      tool.api_headers?.forEach(param => {
        if (param.key && param.value) {
          headers[param.key] = param.value;
        }
      });

      const queryParams: Record<string, string> = {};
      tool.api_query_params?.forEach(param => {
        if (param.key && param.value) {
          queryParams[param.key] = param.value;
        }
      });

      const pathParams: Record<string, string> = {};
      tool.api_path_params?.forEach(param => {
        if (param.key && param.value) {
          pathParams[param.key] = param.value;
        }
      });

      return {
        name: tool.name,
        description: tool.description,
        api_url: tool.api_url,
        api_method: tool.api_method,
        api_headers: headers,
        api_query_params: queryParams,
        api_path_params: pathParams,
        request_payload: tool.request_payload || ''
      };
    });

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentName,
          description: agentDescription,
          settings: settings,
          tools: transformedTools
        }),
      });

      if (response.ok) {
        const updatedAgent = await response.json();
        onSave(updatedAgent);
      } else {
        console.error('Failed to update agent:', await response.text());
      }
    } catch (error) {
      console.error('Error updating agent:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onCancel} variant="outline" className="bg-black/50 border-white/15 text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Agent</h1>
            <p className="text-white/70">Update your agent configuration</p>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-500">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Agent Name & Description */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 rounded-lg bg-black/30 border border-white/15"
      >
        <div className="space-y-4">
          <div>
            <Label className="text-white">Agent Name</Label>
            <Input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="bg-black/50 border-white/15 text-white"
              placeholder="My LangChain Agent"
            />
          </div>
          <div>
            <Label className="text-white">Description</Label>
            <Input
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              className="bg-black/50 border-white/15 text-white"
              placeholder="A helpful AI agent"
            />
          </div>
        </div>
      </motion.div>

      {/* Provider & Model Configuration */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-6 rounded-lg bg-black/30 border border-white/15"
      >
        <h2 className="text-xl font-bold text-white mb-4">LLM Configuration</h2>
        <div className="space-y-4">
          <ProviderSelector
            selectedProvider={settings.providerId}
            selectedModel={settings.modelId}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
          />
          
          <div>
            <Label className="text-white">API Key</Label>
            <Input
              {...register('apiKey')}
              type="password"
              className="bg-black/50 border-white/15 text-white"
              placeholder="Enter your API key"
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-white">Temperature ({settings.temperature})</Label>
            <input
              type="range"
              {...register('temperature')}
              min="0"
              max="2"
              step="0.1"
              className="w-full"
              onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            />
          </div>

          <div>
            <Label className="text-white">System Prompt</Label>
            <textarea
              {...register('systemPrompt')}
              className="w-full min-h-[100px] rounded-md border border-white/15 bg-black/50 px-3 py-2 text-white"
              placeholder="You are a helpful AI assistant."
              onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
            />
          </div>
        </div>
      </motion.div>

      {/* Tools Configuration */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 p-6 rounded-lg bg-black/30 border border-white/15"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Tools Configuration</h2>
          <Button onClick={addTool} variant="outline" className="bg-white text-black hover:bg-gray-100">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Tool
          </Button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
          {tools.map((tool, index) => (
            <div key={tool.id} className="p-4 border border-white/15 rounded-lg bg-black/20">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-medium">Tool {index + 1}</h3>
                {tools.length > 1 && (
                  <Button
                    onClick={() => removeTool(tool.id)}
                    variant="outline"
                    size="sm"
                    className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Tool Name"
                  value={tool.name}
                  onChange={e => updateToolField(tool.id, 'name', e.target.value)}
                  className="bg-black/50 border-white/15 text-white"
                />
                <Input
                  placeholder="Description"
                  value={tool.description}
                  onChange={e => updateToolField(tool.id, 'description', e.target.value)}
                  className="bg-black/50 border-white/15 text-white"
                />
                <Input
                  placeholder="API URL"
                  value={tool.api_url}
                  onChange={e => updateToolField(tool.id, 'api_url', e.target.value)}
                  className="bg-black/50 border-white/15 text-white"
                />

                <select
                  value={tool.api_method}
                  onChange={e => updateToolField(tool.id, 'api_method', e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}
                  className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                {/* Headers */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-white/80">Headers</Label>
                    <Button
                      onClick={() => addParam(tool.id, 'api_headers')}
                      size="sm"
                      variant="outline"
                      className="bg-black/50 border-white/15 text-white hover:bg-black/70"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add Header
                    </Button>
                  </div>
                  {tool.api_headers.map(header => (
                    <div key={header.id} className="flex gap-2">
                      <Input
                        placeholder="Key"
                        value={header.key}
                        onChange={e => updateParam(tool.id, 'api_headers', header.id, 'key', e.target.value)}
                        className="bg-black/50 border-white/15 text-white"
                      />
                      <Input
                        placeholder="Value"
                        value={header.value}
                        onChange={e => updateParam(tool.id, 'api_headers', header.id, 'value', e.target.value)}
                        className="bg-black/50 border-white/15 text-white"
                      />
                      <Button
                        onClick={() => removeParam(tool.id, 'api_headers', header.id)}
                        size="sm"
                        variant="outline"
                        className="bg-red-500/20 border-red-500/50 text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Query Params */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-white/80">Query Parameters</Label>
                    <Button
                      onClick={() => addParam(tool.id, 'api_query_params')}
                      size="sm"
                      variant="outline"
                      className="bg-black/50 border-white/15 text-white hover:bg-black/70"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add Query Param
                    </Button>
                  </div>
                  {tool.api_query_params.map(param => (
                    <div key={param.id} className="flex gap-2">
                      <Input
                        placeholder="Key"
                        value={param.key}
                        onChange={e => updateParam(tool.id, 'api_query_params', param.id, 'key', e.target.value)}
                        className="bg-black/50 border-white/15 text-white"
                      />
                      <Input
                        placeholder="Value"
                        value={param.value}
                        onChange={e => updateParam(tool.id, 'api_query_params', param.id, 'value', e.target.value)}
                        className="bg-black/50 border-white/15 text-white"
                      />
                      <Button
                        onClick={() => removeParam(tool.id, 'api_query_params', param.id)}
                        size="sm"
                        variant="outline"
                        className="bg-red-500/20 border-red-500/50 text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Request Payload */}
                <div className="space-y-2">
                  <Label className="text-white/80">Request Payload (JSON)</Label>
                  <textarea
                    placeholder='{"key": "value"}'
                    value={tool.request_payload}
                    onChange={e => updateToolField(tool.id, 'request_payload', e.target.value)}
                    className="w-full min-h-[80px] rounded-md border border-white/15 bg-black/50 px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

