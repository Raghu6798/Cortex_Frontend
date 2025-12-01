'use client';

import React, { useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Provider } from 'jotai';
import { WorkflowCanvas } from '@/components/workflow/ui/workflow-canvas';
import { NodeConfigPanel } from '@/components/workflow/ui/node-config-panel';
import { useSetAtom } from 'jotai';
import { 
  nodesAtom, 
  edgesAtom, 
  currentWorkflowNameAtom,
  WorkflowNode 
} from '@/lib/workflow-store';
import { nanoid } from 'nanoid';

export function MultiAgentWorkflowView() {
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  const setCurrentWorkflowName = useSetAtom(currentWorkflowNameAtom);
  const initialized = useRef(false);

  // Initialize a default workflow state
  useEffect(() => {
    if (!initialized.current) {
      const defaultTriggerNode: WorkflowNode = {
        id: nanoid(),
        type: "trigger",
        position: { x: 100, y: 200 },
        data: {
          label: "Manual Trigger",
          type: "trigger",
          config: { triggerType: "Manual" },
          status: "idle",
        },
      };
      
      setNodes([defaultTriggerNode]);
      setEdges([]);
      setCurrentWorkflowName("New Agent Workflow");
      initialized.current = true;
    }
  }, [setNodes, setEdges, setCurrentWorkflowName]);

  return (
    <div className="relative h-full w-full bg-background overflow-hidden">
      <WorkflowCanvas />
      
      {/* Right Sidebar for Node Config (Overlay) */}
      <div className="absolute top-0 right-0 h-full w-80 border-l bg-background z-20 pointer-events-auto">
        <NodeConfigPanel />
      </div>
    </div>
  );
}

// Wrapper with providers
export default function MultiAgentWorkflowViewWithProviders() {
  return (
    <Provider>
      <ReactFlowProvider>
        <div className="h-screen w-full relative">
          <MultiAgentWorkflowView />
        </div>
      </ReactFlowProvider>
    </Provider>
  );
}

