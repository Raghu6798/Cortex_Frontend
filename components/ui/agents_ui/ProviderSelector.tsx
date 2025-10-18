// components/ui/ProviderSelector.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { apiClient, Provider, Model } from "@/lib/apiClient";

interface ProviderSelectorProps {
  selectedProvider?: string;
  selectedModel?: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export default function ProviderSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  className = "",
}: ProviderSelectorProps) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const data = await apiClient.getProviders(token || undefined);
        setProviders(data);
      } catch (error) { console.error("Failed to fetch providers:", error); }
      finally { setLoading(false); }
    };
    fetchProviders();
  }, [getToken]);
  const selectedProviderData = providers.find((p) => p.name === selectedProvider);
  const availableModels = selectedProviderData?.models || [];

  const handleProviderSelect = (providerName: string) => {
    onProviderChange(providerName);
    setIsProviderOpen(false);
    const newProvider = providers.find(p => p.name === providerName);
    if (newProvider && newProvider.models.length > 0) {
      onModelChange(newProvider.models[0].model_id);
    }
  };

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsModelOpen(false);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-10 w-full bg-gray-800/50 rounded-md animate-pulse"></div>
        <div className="h-10 w-full bg-gray-800/50 rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-400 text-sm p-4 bg-red-900/20 border border-red-500/30 rounded-md ${className}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Provider Selection */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">LLM Provider</label>
        <button
          type="button"
          onClick={() => setIsProviderOpen(!isProviderOpen)}
          className="relative w-full bg-gray-900/50 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <div className="flex items-center">
            {selectedProviderData?.logo_url && (
              <Image 
                src={selectedProviderData.logo_url} 
                alt={selectedProviderData.display_name} 
                width={20} 
                height={20} 
                className="mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <span className="block truncate text-white">{selectedProviderData?.display_name || "Select a provider"}</span>
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </span>
        </button>

        {isProviderOpen && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-white hover:bg-gray-700"
                onClick={() => handleProviderSelect(provider.name)}
              >
                <div className="flex items-center">
                  {provider.logo_url && (
                    <Image 
                      src={provider.logo_url} 
                      alt={provider.display_name} 
                      width={20} 
                      height={20} 
                      className="mr-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <div className="font-medium">{provider.display_name}</div>
                    {provider.description && (
                      <div className="text-sm text-gray-400">{provider.description}</div>
                    )}
                  </div>
                </div>
                {selectedProvider === provider.name && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <CheckIcon className="h-5 w-5 text-purple-400" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Selection */}
      {selectedProvider && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
          <button
            type="button"
            onClick={() => setIsModelOpen(!isModelOpen)}
            className="relative w-full bg-gray-900/50 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <span className="block truncate text-white">{availableModels.find(m => m.model_id === selectedModel)?.display_name || "Select a model"}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </button>

          {isModelOpen && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
              {availableModels.map((model) => (
                <div
                  key={model.model_id}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-white hover:bg-gray-700"
                  onClick={() => handleModelSelect(model.model_id)}
                >
                  <div>
                    <div className="font-medium">{model.display_name}</div>
                    {model.description && (
                      <div className="text-sm text-gray-400">{model.description}</div>
                    )}
                    <div className="text-xs text-gray-500">Context: {model.context_length.toLocaleString()} tokens</div>
                  </div>
                  {selectedModel === model.model_id && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <CheckIcon className="h-5 w-5 text-purple-400" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    
    </div>
  );
}