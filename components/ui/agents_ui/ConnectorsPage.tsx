'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoLogoVercel } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import { FaSlack } from "react-icons/fa";
import { 
  Database, 
  Mail, 
  Calendar, 
  Zap,
  CheckCircle,
  Clock,
  Settings,
  ExternalLink,
  Plus,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/Input';
import { Badge } from '@/components/ui/shadcn/badge';

// Vercel Logo SVG Component

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  status: 'connected' | 'disconnected' | 'pending';
  category: 'development' | 'communication' | 'deployment' | 'data';
  lastSync?: string;
  features: string[];
}

const connectors: Connector[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect your repositories, issues, and pull requests for seamless development workflows.',
    icon: FaGithub,
    status: 'connected',
    category: 'development',
    lastSync: '2 minutes ago',
    features: ['Repository Access', 'Issue Tracking', 'PR Management', 'Webhook Integration']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Integrate with your team communication channels for notifications and updates.',
    icon: FaSlack,
    status: 'connected',
    category: 'communication',
    lastSync: '5 minutes ago',
    features: ['Channel Integration', 'Bot Notifications', 'File Sharing', 'Team Collaboration']
  },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Deploy and manage your applications with automatic deployments and previews.',
      icon: IoLogoVercel,
      status: 'disconnected',
      category: 'deployment',
      features: ['Auto Deployments', 'Preview URLs', 'Analytics', 'Edge Functions']
    },
  {
    id: 'database',
    name: 'Database',
    description: 'Connect to your PostgreSQL, MySQL, or MongoDB databases for data operations.',
    icon: Database,
    status: 'pending',
    category: 'data',
    features: ['Query Execution', 'Schema Management', 'Data Migration', 'Backup & Restore']
  },
  {
    id: 'email',
    name: 'Email Service',
    description: 'Send transactional emails and notifications through your preferred email provider.',
    icon: Mail,
    status: 'disconnected',
    category: 'communication',
    features: ['Transactional Emails', 'Templates', 'Analytics', 'Delivery Tracking']
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Sync with Google Calendar, Outlook, or other calendar services for scheduling.',
    icon: Calendar,
    status: 'disconnected',
    category: 'communication',
    features: ['Event Creation', 'Scheduling', 'Reminders', 'Meeting Integration']
  }
];

const categoryColors = {
  development: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  communication: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  deployment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  data: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
};

const statusColors = {
  connected: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  disconnected: 'bg-white/10 text-white/60 border-white/20',
  pending: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
};

export default function ConnectorsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>(connectors);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = connectors;

    if (searchQuery) {
      filtered = filtered.filter(connector =>
        connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connector.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(connector => connector.category === selectedCategory);
    }

    setFilteredConnectors(filtered);
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', name: 'All', count: connectors.length },
    { id: 'development', name: 'Development', count: connectors.filter(c => c.category === 'development').length },
    { id: 'communication', name: 'Communication', count: connectors.filter(c => c.category === 'communication').length },
    { id: 'deployment', name: 'Deployment', count: connectors.filter(c => c.category === 'deployment').length },
    { id: 'data', name: 'Data', count: connectors.filter(c => c.category === 'data').length }
  ];

  const SkeletonCard = () => (
    <Card className="bg-black/30 border-white/15 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-5 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-white/5 rounded animate-pulse" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-white/10 rounded animate-pulse w-16" />
            <div className="h-6 bg-white/10 rounded animate-pulse w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 space-y-6"
      >
        <div className="space-y-4">
          <div className="h-8 bg-white/10 rounded animate-pulse w-64" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-96" />
        </div>
        
        <div className="flex gap-4 mb-6">
          <div className="h-10 bg-white/10 rounded animate-pulse w-80" />
          <div className="h-10 bg-white/10 rounded animate-pulse w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 bg-black min-h-screen"
    >

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/30 border-white/15 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id 
                ? "bg-purple-500/20 border-purple-500/30 text-purple-300" 
                : "bg-black/30 border-white/15 text-white hover:bg-white/10"
              }
            >
              {category.name}
              <Badge variant="secondary" className="ml-2 bg-white/10 text-white/70">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Connectors Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${searchQuery}-${selectedCategory}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredConnectors.map((connector, index) => (
            <motion.div
              key={connector.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="bg-black/30 border-white/15 backdrop-blur-sm hover:bg-black/50 transition-all duration-300 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/30 border border-white/15 flex items-center justify-center">
                        <connector.icon className="w-5 h-5" style={{ color: 'currentColor' }} />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{connector.name}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 ${statusColors[connector.status]}`}
                        >
                          {connector.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {connector.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {connector.status.charAt(0).toUpperCase() + connector.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/40 hover:text-white hover:bg-white/10"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-white/70">
                    {connector.description}
                  </CardDescription>

                  {connector.lastSync && (
                    <div className="text-xs text-white/50">
                      Last synced: {connector.lastSync}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-white/80">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {connector.features.slice(0, 3).map((feature, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs bg-white/5 border-white/10 text-white/70"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {connector.features.length > 3 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-white/5 border-white/10 text-white/70"
                        >
                          +{connector.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Badge 
                      variant="outline" 
                      className={categoryColors[connector.category]}
                    >
                      {connector.category}
                    </Badge>
                    
                    <div className="flex gap-2">
                      {connector.status === 'connected' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredConnectors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Zap className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/80 mb-2">No connectors found</h3>
          <p className="text-white/50">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}
    </motion.div>
  );
}
