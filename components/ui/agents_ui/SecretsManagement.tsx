'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Plus, Trash2, Eye, EyeOff, Key, Shield } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/Input';
import { Card } from '@/components/ui/shadcn/card';
import { Label } from '@/components/ui/shadcn/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/shadcn/dialog';
import { apiClient, Secret, SecretCreate } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface SecretsManagementProps {
  onSecretSelect?: (secretName: string) => void;
  selectedSecretName?: string;
  showSelector?: boolean;
}

export default function SecretsManagement({ 
  onSecretSelect, 
  selectedSecretName, 
  showSelector = false 
}: SecretsManagementProps) {
  const { getToken } = useAuth();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSecret, setNewSecret] = useState<SecretCreate>({ name: '', value: '' });
  const [showValue, setShowValue] = useState<{ [key: string]: boolean }>({});
  const [deletingSecret, setDeletingSecret] = useState<string | null>(null);

  const loadSecrets = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (token) {
        const secretsData = await apiClient.getSecrets(token);
        setSecrets(secretsData);
      }
    } catch (error) {
      console.error('Failed to load secrets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Load secrets on component mount
  useEffect(() => {
    loadSecrets();
  }, [loadSecrets]);

  const handleCreateSecret = async () => {
    if (!newSecret.name.trim() || !newSecret.value.trim()) {
      return;
    }

    try {
      setIsCreating(true);
      const token = await getToken();
      if (token) {
        const createdSecret = await apiClient.createSecret(newSecret, token);
        setSecrets(prev => [...prev, createdSecret]);
        setNewSecret({ name: '', value: '' });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create secret:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSecret = async (secretId: string) => {
    const secret = secrets.find(s => s.id === secretId);
    const secretName = secret?.name || 'this secret';
    
    if (!confirm(`Are you sure you want to delete "${secretName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingSecret(secretId);
      const token = await getToken();
      if (token) {
        await apiClient.deleteSecret(secretId, token);
        setSecrets(prev => prev.filter(secret => secret.id !== secretId));
      }
    } catch (error) {
      console.error('Failed to delete secret:', error);
      alert('Failed to delete secret. Please try again.');
    } finally {
      setDeletingSecret(null);
    }
  };

  const toggleShowValue = (secretId: string) => {
    setShowValue(prev => ({
      ...prev,
      [secretId]: !prev[secretId]
    }));
  };

  const handleSecretSelect = (secretName: string) => {
    if (onSecretSelect) {
      onSecretSelect(secretName);
    }
  };

  if (showSelector) {
    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium text-white">Select Secret</Label>
        <div className="grid gap-2">
          {secrets.map((secret) => (
            <Card
              key={secret.id}
              className={cn(
                "p-3 cursor-pointer transition-colors hover:bg-white/10 bg-black/20 border-white/15",
                selectedSecretName === secret.name && "bg-purple-600/20 border-purple-500"
              )}
              onClick={() => handleSecretSelect(secret.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-400" />
                  <span className="font-medium text-white">{secret.name}</span>
                </div>
                {selectedSecretName === secret.name && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-black/30 p-6 rounded-lg border border-white/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Secrets Management</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-black/90 border-white/15 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Secret</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="secret-name" className="text-white">Secret Name</Label>
                <Input
                  id="secret-name"
                  placeholder="e.g., My NVIDIA API Key"
                  value={newSecret.name}
                  onChange={(e) => setNewSecret(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                />
              </div>
              <div>
                <Label htmlFor="secret-value" className="text-white">Secret Value</Label>
                <div className="relative">
                  <Input
                    id="secret-value"
                    type={showValue['new'] ? 'text' : 'password'}
                    placeholder="Enter your secret value"
                    value={newSecret.value}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                    className="bg-black/50 border-white/15 text-white placeholder:text-white/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-white hover:bg-white/10"
                    onClick={() => setShowValue(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showValue['new'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateSecret}
                  disabled={isCreating || !newSecret.name.trim() || !newSecret.value.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isCreating ? 'Creating...' : 'Create Secret'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-white/15 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 bg-black/20 border-white/15">
              <div className="animate-pulse">
                <div className="h-4 bg-white/20 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : secrets.length === 0 ? (
        <Card className="p-8 text-center bg-black/20 border-white/15">
          <Shield className="h-12 w-12 text-white/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-white">No secrets yet</h3>
          <p className="text-white/60 mb-4">
            Create your first secret to securely store API keys and tokens.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Secret
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {secrets.map((secret) => (
            <Card key={secret.id} className="p-4 bg-black/20 border-white/15">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="font-medium text-white truncate">{secret.name}</span>
                  </div>
                  <div className="text-sm text-white/60">
                    Created: {new Date(secret.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleShowValue(secret.id)}
                    className="text-white hover:bg-white/10 p-2"
                  >
                    {showValue[secret.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSecret(secret.id)}
                    disabled={deletingSecret === secret.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 disabled:opacity-50"
                    title="Delete secret"
                  >
                    {deletingSecret === secret.id ? (
                      <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {showValue[secret.id] && (
                <div className="mt-3 p-2 bg-black/50 border border-white/15 rounded text-sm font-mono text-white/80">
                  {secret.name} (value is encrypted and not displayed)
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
