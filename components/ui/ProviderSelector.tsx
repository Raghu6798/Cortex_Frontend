"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { apiClient, Provider, Model } from '@/lib/apiClient';

// Types are now imported from apiClient

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
  className = ""
}: ProviderSelectorProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProviders();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);
  const availableModels = selectedProviderData?.models || [];

  const handleProviderSelect = (providerId: string) => {
    onProviderChange(providerId);
    setIsProviderOpen(false);
    // Reset model selection when provider changes
    if (availableModels.length > 0) {
      onModelChange(availableModels[0].model_id);
    }
  };

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsModelOpen(false);
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Provider Selection */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          LLM Provider
        </label>
        <button
          type="button"
          onClick={() => setIsProviderOpen(!isProviderOpen)}
          className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center">
            {selectedProviderData?.logo_url && (
              <Image
                src={selectedProviderData.logo_url}
                alt={selectedProviderData.display_name}
                width={20}
                height={20}
                className="mr-3"
              />
            )}
            <span className="block truncate">
              {selectedProviderData?.display_name || 'Select a provider'}
            </span>
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </span>
        </button>

        {isProviderOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                onClick={() => handleProviderSelect(provider.id)}
              >
                <div className="flex items-center">
                  {provider.logo_url && (
                    <Image
                      src={provider.logo_url}
                      alt={provider.display_name}
                      width={20}
                      height={20}
                      className="mr-3"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {provider.display_name}
                    </div>
                    {provider.description && (
                      <div className="text-sm text-gray-500">
                        {provider.description}
                      </div>
                    )}
                  </div>
                </div>
                {selectedProvider === provider.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <CheckIcon className="h-5 w-5 text-blue-600" />
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <button
            type="button"
            onClick={() => setIsModelOpen(!isModelOpen)}
            className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="block truncate">
              {availableModels.find(m => m.model_id === selectedModel)?.display_name || 'Select a model'}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </button>

          {isModelOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
              {availableModels.map((model) => (
                <div
                  key={model.model_id}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                  onClick={() => handleModelSelect(model.model_id)}
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {model.display_name}
                    </div>
                    {model.description && (
                      <div className="text-sm text-gray-500">
                        {model.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Context: {model.context_length.toLocaleString()} tokens
                    </div>
                  </div>
                  {selectedModel === model.model_id && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Provider Features */}
      {selectedProviderData && (
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 mb-2">Provider Features:</div>
          <div className="flex flex-wrap gap-2">
            {selectedProviderData.supports_streaming && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Streaming
              </span>
            )}
            {selectedProviderData.supports_tools && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Tools
              </span>
            )}
            {selectedProviderData.supports_embeddings && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Embeddings
              </span>
            )}
            {selectedProviderData.requires_api_key && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                API Key Required
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
