"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, ShieldCheck, Globe, Zap, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/shadcn";
import { MCP } from '@lobehub/icons';

export interface MCPServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  iconUrl?: string;
  remote?: boolean;
  deploymentUrl?: string;
  connections: Array<{
    type: string;
    url?: string;
    configSchema?: any;
  }>;
  security: {
    scanPassed?: boolean;
  };
  tools: Array<{
    name: string;
    description: string;
    inputSchema: any;
  }>;
}

interface MCPServerCardProps {
  server: MCPServer;
}

export const MCPServerCard: React.FC<MCPServerCardProps> = ({ server }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="h-full overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
        <CardHeader className="relative p-6 pb-2 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-14 w-14 rounded-xl border border-border/50 bg-card p-2 shadow-sm group-hover:border-primary/50 transition-colors duration-300 flex items-center justify-center overflow-hidden">
                  {server.iconUrl ? (
                    <img
                      src={server.iconUrl}
                      alt={server.displayName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <MCP className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">
                  {server.displayName}
                </h3>
                <code className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded font-mono">
                  {server.qualifiedName}
                </code>
              </div>
            </div>
            {server.security?.scanPassed && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-500">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Security Scan Passed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-2 space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">
            {server.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 transition-colors gap-1 border-primary/20">
              <Terminal className="h-3 w-3" />
              {server.tools?.length || 0} Tools
            </Badge>
            {server.remote && (
              <Badge variant="outline" className="bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1">
                <Globe className="h-3 w-3" />
                Remote
              </Badge>
            )}
            {(server.connections || []).map(c => c.type).includes("stdio") && (
               <Badge variant="outline" className="bg-orange-500/5 hover:bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1">
                <Zap className="h-3 w-3" />
                Stdio
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 bg-muted/20 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex -space-x-2">
            {/* Tool Preview Icons/Avatars if needed */}
             {(server.tools || []).slice(0, 3).map((tool, i) => (
               <div key={i} className="h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-mono z-10" title={tool.name}>
                 {tool.name[0].toUpperCase()}
               </div>
             ))}
             {(server.tools?.length || 0) > 3 && (
               <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] z-0 pl-1">
                 +{(server.tools?.length || 0) - 3}
               </div>
             )}
          </div>
          
          {server.deploymentUrl && (
             <a 
               href={server.deploymentUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-1 hover:text-primary transition-colors"
             >
               Visit <ExternalLink className="h-3 w-3" />
             </a>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};
