'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '../shadcn';
import { Label } from '@/components/ui/shadcn/label';
import { Textarea } from '../shadcn/textarea';
import { Badge } from '@/components/ui/shadcn/badge';
import { Terminal, Code, Package, Shield } from 'lucide-react';

interface CodingAgentConfigProps {
  onSave: (config: CodingAgentConfig) => void;
  initialConfig?: Partial<CodingAgentConfig>;
}

interface CodingAgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  timeout: number;
  defaultPackages: string[];
  allowedPackages: string[];
  maxExecutionTime: number;
  enableFileSystem: boolean;
  enableNetwork: boolean;
  enableGPU: boolean;
}

const CODING_AGENT_DEFAULTS: CodingAgentConfig = {
  name: 'Python Coding Assistant',
  description: 'A secure Python coding assistant with E2B sandbox execution',
  systemPrompt: `You are a helpful Python coding assistant. You can execute Python code in a secure, isolated sandbox environment.

Key capabilities:
- Execute Python code safely
- Install packages as needed
- Handle data analysis, visualization, and computation
- Provide explanations for code and results
- Debug and fix code issues

Always use the execute_python_code tool for any code execution. The sandbox is secure and isolated, so you can safely run any Python code.

When executing code:
1. Explain what the code does
2. Execute the code using the sandbox
3. Show the results
4. Explain the output and any insights`,
  timeout: 300,
  defaultPackages: ['pandas', 'numpy', 'matplotlib', 'seaborn', 'requests'],
  allowedPackages: [],
  maxExecutionTime: 30,
  enableFileSystem: true,
  enableNetwork: true,
  enableGPU: false,
};

const POPULAR_PACKAGES = [
  'pandas', 'numpy', 'matplotlib', 'seaborn', 'scikit-learn',
  'requests', 'beautifulsoup4', 'flask', 'django', 'fastapi',
  'tensorflow', 'torch', 'opencv-python', 'pillow', 'plotly'
];

export default function CodingAgentConfig({ onSave, initialConfig }: CodingAgentConfigProps) {
  const [config, setConfig] = useState<CodingAgentConfig>({
    ...CODING_AGENT_DEFAULTS,
    ...initialConfig,
  });

  const [newPackage, setNewPackage] = useState('');

  const handleSave = () => {
    onSave(config);
  };

  const addPackage = () => {
    if (newPackage.trim() && !config.defaultPackages.includes(newPackage.trim())) {
      setConfig(prev => ({
        ...prev,
        defaultPackages: [...prev.defaultPackages, newPackage.trim()]
      }));
      setNewPackage('');
    }
  };

  const removePackage = (packageName: string) => {
    setConfig(prev => ({
      ...prev,
      defaultPackages: prev.defaultPackages.filter(pkg => pkg !== packageName)
    }));
  };

  const addPopularPackage = (packageName: string) => {
    if (!config.defaultPackages.includes(packageName)) {
      setConfig(prev => ({
        ...prev,
        defaultPackages: [...prev.defaultPackages, packageName]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Coding Agent Configuration
          </CardTitle>
          <CardDescription>
            Configure your secure Python coding assistant with E2B sandbox execution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Python Coding Assistant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout">Sandbox Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 300 }))}
                placeholder="300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this coding agent does..."
              rows={2}
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={config.systemPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder="Enter the system prompt for your coding agent..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* Default Packages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Default Packages</Label>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {config.defaultPackages.length} packages
              </Badge>
            </div>

            {/* Package Input */}
            <div className="flex gap-2">
              <Input
                value={newPackage}
                onChange={(e) => setNewPackage(e.target.value)}
                placeholder="Add package (e.g., pandas, numpy)"
                onKeyPress={(e) => e.key === 'Enter' && addPackage()}
              />
              <Button onClick={addPackage} disabled={!newPackage.trim()}>
                Add
              </Button>
            </div>

            {/* Popular Packages */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Popular Packages</Label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_PACKAGES.map((pkg) => (
                  <Button
                    key={pkg}
                    variant="outline"
                    size="sm"
                    onClick={() => addPopularPackage(pkg)}
                    disabled={config.defaultPackages.includes(pkg)}
                    className="text-xs"
                  >
                    {pkg}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Packages */}
            {config.defaultPackages.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Selected Packages</Label>
                <div className="flex flex-wrap gap-2">
                  {config.defaultPackages.map((pkg) => (
                    <Badge key={pkg} variant="default" className="flex items-center gap-1">
                      {pkg}
                      <button
                        onClick={() => removePackage(pkg)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Settings
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableFileSystem"
                  checked={config.enableFileSystem}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableFileSystem: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="enableFileSystem" className="text-sm">
                  File System Access
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableNetwork"
                  checked={config.enableNetwork}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableNetwork: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="enableNetwork" className="text-sm">
                  Network Access
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableGPU"
                  checked={config.enableGPU}
                  onChange={(e) => setConfig(prev => ({ ...prev, enableGPU: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="enableGPU" className="text-sm">
                  GPU Access
                </Label>
              </div>
            </div>
          </div>

          {/* Execution Limits */}
          <div className="space-y-2">
            <Label htmlFor="maxExecutionTime">Max Execution Time (seconds)</Label>
            <Input
              id="maxExecutionTime"
              type="number"
              value={config.maxExecutionTime}
              onChange={(e) => setConfig(prev => ({ ...prev, maxExecutionTime: parseInt(e.target.value) || 30 }))}
              placeholder="30"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Save Coding Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
