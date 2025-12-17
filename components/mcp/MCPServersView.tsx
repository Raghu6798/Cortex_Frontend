"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { MCPServerCard, MCPServer } from "@/components/mcp/MCPServerCard";
import { Input } from "@/components/ui/shadcn/Input";
import axios from "axios";

// Standard debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function MCPServersView() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, 500);
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      setIsLoading(true);
      setError(null);
      
      const API_TOKEN = process.env.NEXT_PUBLIC_SMITHERY_API_TOKEN;
      const BASE_URL = "https://registry.smithery.ai/servers";

      if (!API_TOKEN) {
          setError("API Token (NEXT_PUBLIC_SMITHERY_API_TOKEN) is missing.");
          setIsLoading(false);
          return;
      }

      try {
        const params: Record<string, any> = {
            page: 1,
            pageSize: 10
        };
        if (debouncedQuery) {
            params.q = debouncedQuery;
        }

        console.log("🚀 Fetching MCP servers from:", BASE_URL);
        console.log("📝 Query Params:", params);
        console.log("🔑 API Token Present:", !!API_TOKEN);

        const response = await axios.get(BASE_URL, {
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Accept": "application/json",
            },
            params: params
        });

        console.log("✅ Response Status:", response.status);
        console.log("📦 Response Data:", response.data);

        // Based on the screenshot, the API returns { servers: [...], pagination: ... }
        // We need to access .servers property
        const data = response.data;
        console.log("🔍 Raw Data Structure Keys:", Object.keys(data));
        
        const serverList = Array.isArray(data) ? data : (data.servers || []);
        console.log("📋 Parsed Server List Length:", serverList?.length);
        if (serverList?.length > 0) {
            console.log("🔹 First Server Item:", serverList[0]);
        } else {
            console.log("⚠️ Server list is empty or undefined. data.servers:", data.servers);
        }

        setServers(Array.isArray(serverList) ? serverList : []);

      } catch (err: any) {
        console.error("Error fetching MCP servers:", err);
        setError(err.response?.data?.message || err.message || "An error occurred fetching servers.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
  }, [debouncedQuery]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="flex items-center gap-4">
           </div>
           
        <div className="w-full md:w-96 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search servers (e.g., github, memory)..." 
                className="pl-10 h-11 bg-muted/5 border-border/50 focus:border-primary/50 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
      </div>

      {/* Content Section */}
      {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-red-500/5 rounded-xl border border-red-500/10">
              <p className="font-semibold">Error loading servers</p>
              <p className="text-sm opacity-80">{error}</p>
          </div>
      ) : isLoading && servers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Searching Registry...</p>
          </div>
      ) : (
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
            {servers.length > 0 ? (
                servers.map((server) => (
                <motion.div key={server.qualifiedName}>
                    <MCPServerCard server={server} />
                </motion.div>
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <p>No servers found matching "{debouncedQuery}"</p>
                </div>
            )}
            
            {/* 'Add New' Placeholder */}
             <motion.div variants={item} className="h-full min-h-[220px]">
                <div className="h-full rounded-xl border border-dashed border-border hover:border-primary/50 bg-muted/5 hover:bg-muted/20 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer text-muted-foreground hover:text-primary group">
                    <div className="h-12 w-12 rounded-full bg-background border border-border group-hover:border-primary/50 flex items-center justify-center transition-colors">
                        <span className="text-2xl font-thin">+</span>
                    </div>
                    <span className="font-medium text-sm">Connect Custom Server</span>
                </div>
            </motion.div>
        </motion.div>
      )}
    </div>
  );
}
