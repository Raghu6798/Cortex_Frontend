// components/ui/agents_ui/WorkflowBuilder.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow, // <-- Now a named import, inside the braces
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  Panel,
} from '@xyflow/react';
import { useAuth } from '@clerk/nextjs';

import AgentNode, { AgentNodeData } from './AgentNode'; // Import the refined node and its data type

import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/shadcn';
import { PlusCircle } from 'lucide-react';

// Define the nodeTypes outside the component
const nodeTypes = {
  agent: AgentNode,
  // We can add a 'group' type for crews later
};

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { getToken } = useAuth();

  // Fetch agents from your backend on component mount
  useEffect(() => {
    const fetchAndSetAgents = async () => {
      // ... (This logic remains the same as the previous answer)
      try {
        const token = await getToken();
        if (!token) return;
        const response = await fetch('/api/agents', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch agents');
        
        const agentsFromApi = await response.json();

        const agentNodes: Node<AgentNodeData>[] = agentsFromApi.map((agent: any, index: number) => ({
          id: agent.id,
          type: 'agent',
          position: { x: index * 350, y: 100 },
          data: { 
            id: agent.id,
            name: agent.name, 
            framework: agent.framework,
          },
        }));
        setNodes(agentNodes);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAndSetAgents();
  }, [getToken]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );
  
  const addAgentNode = () => {
    // This is a placeholder. Ideally, this would open a modal to select an existing agent.
    const newId = `agent_${nodes.length + 1}`;
    const newNode: Node<AgentNodeData> = {
      id: newId,
      type: 'agent',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        id: newId,
        name: `New Agent ${nodes.length + 1}`,
        framework: 'langchain', // default
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };


  return (
    <div style={{ width: '100%', height: '100%' }} className="rounded-lg overflow-hidden border border-white/15 bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-neutral-900"
      >
        <Panel position="top-left">
            <Button onClick={addAgentNode} variant="outline" className="bg-neutral-800 border-neutral-700 text-white">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Agent
            </Button>
        </Panel>
        <Controls />
        <Background color="#444" gap={16} />
      </ReactFlow>
    </div>
  );
}