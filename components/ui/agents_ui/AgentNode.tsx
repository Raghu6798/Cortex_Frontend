// components/ui/agents_ui/AgentNode.tsx
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot, BrainCircuit } from 'lucide-react';

// The data for this node will come from your backend's AgentDB model
export interface AgentNodeData extends Record<string, unknown> {
  id: string; // The agent's own ID
  name: string;
  framework: string;
  // We can add more specific data later, like the agent's role
  role?: 'Manager' | 'Worker' | 'Researcher'; 
}

function AgentNode({ data }: NodeProps) {
  // Cast data to our AgentNodeData type
  const agentData = data as AgentNodeData;
  
  // A simple way to get a framework-specific icon or color
  const frameworkDetails = {
    langchain: { icon: BrainCircuit, color: 'text-orange-400' },
    crewai: { icon: Bot, color: 'text-blue-400' },
    // Add other frameworks here
  };
  
  const FrameworkIcon = frameworkDetails[agentData.framework as keyof typeof frameworkDetails]?.icon || Bot;
  const iconColor = frameworkDetails[agentData.framework as keyof typeof frameworkDetails]?.color || 'text-purple-400';


  return (
    <div className="p-4 rounded-xl border-2 border-neutral-700 bg-neutral-900 text-white w-72 shadow-xl hover:border-purple-500 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <FrameworkIcon className={`h-6 w-6 ${iconColor}`} />
        <div className="font-bold text-lg truncate">{agentData.name}</div>
      </div>
      <div className="text-xs text-white/70 bg-neutral-800 px-2 py-1 rounded-full inline-block">
        Framework: <span className="font-semibold">{agentData.framework}</span>
      </div>

      {/* Connection points (Handles) for the workflow edges */}
      <Handle type="target" position={Position.Top} className="!bg-gray-500 w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500 w-3 h-3" />
    </div>
  );
}

export default React.memo(AgentNode);