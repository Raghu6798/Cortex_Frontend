import React, { useState } from 'react';
import { Power, Timer, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { toast } from 'sonner';

export const SandboxRuntimeManager = ({ sandboxId, internalId }: { sandboxId: string, internalId: string }) => {
    const [status, setStatus] = useState<'active' | 'killed'>('active');

    const handleTerminate = async () => {
        const res = await fetch(`/api/v1/sandboxes/${internalId}`, { method: 'DELETE' });
        if (res.ok) {
            setStatus('killed');
            toast.error("Sandbox Terminated");
        }
    };

    return (
        <Card className="p-4 bg-black/40 border-purple-500/30 backdrop-blur-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <div>
                        <p className="text-xs text-white/50 uppercase font-bold tracking-tighter">Connected Runtime</p>
                        <p className="text-sm font-mono text-purple-400">{sandboxId}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/5">
                        <Timer className="w-3 h-3 mr-1" /> Extend
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8"
                        onClick={handleTerminate}
                        disabled={status === 'killed'}
                    >
                        <Power className="w-3 h-3 mr-1" /> Stop
                    </Button>
                </div>
            </div>
            
            {status === 'active' && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[10px] text-green-400/80">
                    <ShieldCheck className="w-3 h-3" />
                    Verified E2B Environment Ready for Code Execution
                </div>
            )}
        </Card>
    );
};