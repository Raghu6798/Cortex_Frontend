import React from 'react';
import { MessageSquare, BarChart, Shield } from 'lucide-react';
// Import the LaserFlow component from the provided file
import { LaserFlow } from './LaserFlow';

export default function ProblemSection() {
  return (
    <div className="py-24 text-center relative overflow-hidden" style={{ backgroundColor: '#060010' }}>
      {/* Main LaserFlow Background */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        opacity: 0.4
      }}>
        <LaserFlow
          color="#9333EA"
          wispDensity={0.8}
          flowSpeed={0.25}
          fogIntensity={0.3}
          verticalSizing={1.5}
          horizontalSizing={0.8}
          wispIntensity={3.0}
          mouseTiltStrength={0.015}
          horizontalBeamOffset={0.1}
          verticalBeamOffset={0.0}
        />
      </div>
      
      {/* Additional accent lasers */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: '25%', 
        width: '2px', 
        height: '100%', 
        opacity: 0.25
      }}>
        <LaserFlow
          color="#A855F7"
          verticalBeamOffset={-0.3}
          horizontalBeamOffset={0.0}
          wispDensity={0.4}
          flowSpeed={0.4}
          fogIntensity={0.2}
          verticalSizing={3.0}
          horizontalSizing={0.1}
        />
      </div>
      
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: '25%', 
        width: '2px', 
        height: '100%', 
        opacity: 0.25
      }}>
        <LaserFlow
          color="#C084FC"
          verticalBeamOffset={-0.3}
          horizontalBeamOffset={0.0}
          wispDensity={0.4}
          flowSpeed={0.3}
          fogIntensity={0.2}
          verticalSizing={3.0}
          horizontalSizing={0.1}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-sm font-semibold text-purple-400">The Challenge</h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Building AI Agents is a Mess
        </p>
        
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center group">
            {/* Card with subtle glow effect */}
            <div className="relative p-8 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group-hover:bg-black/30">
              {/* Subtle laser accent for each card */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <LaserFlow
                  color="#9333EA"
                  wispDensity={0.3}
                  flowSpeed={0.6}
                  fogIntensity={0.1}
                  verticalSizing={0.8}
                  horizontalSizing={0.8}
                />
              </div>
              
              <div className="relative z-10">
                <div className="text-purple-400 mb-4">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fragmented Tooling</h3>
                <p className="text-white/70">
                  Juggling separate services for LLMs, vector stores, and state management complicates development.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center group">
            <div className="relative p-8 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group-hover:bg-black/30">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <LaserFlow
                  color="#A855F7"
                  wispDensity={0.3}
                  flowSpeed={0.5}
                  fogIntensity={0.1}
                  verticalSizing={0.8}
                  horizontalSizing={0.8}
                />
              </div>
              
              <div className="relative z-10">
                <div className="text-purple-400 mb-4">
                  <BarChart size={40} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Scalability Issues</h3>
                <p className="text-white/70">
                  Scaling from a prototype to a multi-tenant production app is complex and error-prone.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center group">
            <div className="relative p-8 rounded-xl bg-black/20 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group-hover:bg-black/30">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <LaserFlow
                  color="#C084FC"
                  wispDensity={0.3}
                  flowSpeed={0.4}
                  fogIntensity={0.1}
                  verticalSizing={0.8}
                  horizontalSizing={0.8}
                />
              </div>
              
              <div className="relative z-10">
                <div className="text-purple-400 mb-4">
                  <Shield size={40} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Lack of Standards</h3>
                <p className="text-white/70">
                  No best practices for persistence, context management, or provider abstraction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
