'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Provider } from 'jotai';
import { Toaster } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { PersistentCanvas } from '@/components/workflow/ui/persistent-canvas.page';
import { NodeConfigPanel } from '@/components/workflow/ui/node-config-panel';
import { useSetAtom } from 'jotai';
import { 
  nodesAtom, 
  edgesAtom, 
  currentWorkflowNameAtom,
  WorkflowNode 
} from '@/lib/workflow-store';
import { nanoid } from 'nanoid';

// Wrapper component to handle Jotai initialization
function BuilderContent() {
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
    <div className="relative h-full w-full bg-background">
      <PersistentCanvas />
      
      {/* Right Sidebar for Node Config (Overlay) */}
      <div className="absolute top-0 right-0 h-full w-80 border-l bg-background z-20 pointer-events-auto">
        <NodeConfigPanel />
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        onNewAgentClick={() => {}}
        activeView={'builder'}
      />

      <main className={cn(
        'flex-1 flex flex-col transition-all duration-300 ease-in-out h-full relative',
        isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
      )}>
        {/* We need Providers here because the Vercel template relies on them being higher up */}
        <Provider>
          <ReactFlowProvider>
            <BuilderContent />
            <Toaster />
          </ReactFlowProvider>
        </Provider>
      </main>
    </div>
  );
}