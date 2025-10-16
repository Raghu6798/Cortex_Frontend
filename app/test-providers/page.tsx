"use client";

import React, { useState } from 'react';
import ProviderSelector from '@/components/ui/ProviderSelector';

export default function TestProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    console.log('Selected provider:', providerId);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    console.log('Selected model:', modelId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/15 p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            LLM Provider Selection Test
          </h1>
          
          <div className="bg-white/5 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Current Selection:</h2>
            <div className="space-y-2">
              <p className="text-white/80">
                <span className="font-medium">Provider:</span> {selectedProvider || 'None selected'}
              </p>
              <p className="text-white/80">
                <span className="font-medium">Model:</span> {selectedModel || 'None selected'}
              </p>
            </div>
          </div>

          <ProviderSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            className="bg-white/5 p-6 rounded-lg"
          />

          <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-green-400 mb-2">✅ Features Implemented:</h3>
            <ul className="text-green-300 space-y-1 text-sm">
              <li>• Provider selection with logos and descriptions</li>
              <li>• Model selection based on chosen provider</li>
              <li>• Real-time API integration</li>
              <li>• Provider feature indicators (streaming, tools, embeddings)</li>
              <li>• Responsive design with loading states</li>
              <li>• Error handling and fallbacks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


