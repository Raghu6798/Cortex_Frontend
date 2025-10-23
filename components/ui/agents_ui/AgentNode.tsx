// components/ui/agents_ui/AgentNode.tsx
import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Bot, BrainCircuit } from 'lucide-react';

// The data for this node will come from your backend's AgentDB model
export interface AgentNodeData extends Record<string, unknown> {
  id: string; // The agent's own ID
  name: string;
  framework: string;
  role?: 'Manager' | 'Worker' | 'Researcher'; 
}

function AgentNode({ data, id }: NodeProps) {
  // Cast data to our AgentNodeData type
  const agentData = data as AgentNodeData;
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(agentData.name);
  
  // A simple way to get a framework-specific icon or color
  const frameworkDetails = {
    langchain: { icon: BrainCircuit, color: 'text-orange-400' },
    crewai: { icon: Bot, color: 'text-blue-400' },
    agno: { icon: Bot, color: 'text-purple-400' },
    // Add other frameworks here
  };
  
  const FrameworkIcon = frameworkDetails[agentData.framework as keyof typeof frameworkDetails]?.icon || Bot;
  const iconColor = frameworkDetails[agentData.framework as keyof typeof frameworkDetails]?.color || 'text-purple-400';

  const handleNameEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleNameSave = useCallback(() => {
    if (editName.trim() && editName !== agentData.name) {
      updateNodeData(id, { name: editName.trim() });
    }
    setIsEditing(false);
  }, [editName, agentData.name, updateNodeData, id]);

  const handleNameCancel = useCallback(() => {
    setEditName(agentData.name);
    setIsEditing(false);
  }, [agentData.name]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  }, [handleNameSave, handleNameCancel]);


  return (
    <div className="p-4 rounded-xl border-2 border-neutral-700 bg-neutral-900 text-white w-72 shadow-xl hover:border-purple-500 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <FrameworkIcon className={`h-6 w-6 ${iconColor}`} />
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleKeyDown}
            className="font-bold text-lg bg-transparent border-b border-white/30 focus:border-white/70 focus:outline-none flex-1"
            autoFocus
          />
        ) : (
          <div 
            className="font-bold text-lg truncate cursor-pointer hover:text-white/80 transition-colors"
            onDoubleClick={handleNameEdit}
            title="Double-click to rename"
          >
            {agentData.name}
          </div>
        )}
      </div>

      {/* Connection points (Handles) for the workflow edges */}
      <Handle type="target" position={Position.Top} className="!bg-gray-500 w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500 w-3 h-3" />
    </div>
  );
}

export default React.memo(AgentNode);