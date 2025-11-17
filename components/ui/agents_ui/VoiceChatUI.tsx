"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import VoiceBorb from './VoiceBorb';

const VoiceChatUI = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  // const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Initialize audio monitoring
  useEffect(() => {
    if (isConnected) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Store stream for reuse in recording
          audioStreamRef.current = stream;
          
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(stream);
          
          source.connect(analyser);
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;
          
          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
          
          // Use time domain data for better voice detection
          const dataArray = new Uint8Array(analyser.fftSize);
          
          const updateAudioLevel = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteTimeDomainData(dataArray);
              // Calculate RMS (Root Mean Square) for better amplitude detection
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                const normalized = (dataArray[i] - 128) / 128;
                sum += normalized * normalized;
              }
              const rms = Math.sqrt(sum / dataArray.length);
              // Scale RMS (0-1) to 0-255 range and apply some amplification for voice
              const level = Math.min(rms * 255 * 3, 255);
              setAudioLevel(level);
            }
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          };
          
          updateAudioLevel();
        })
        .catch(console.error);
    } else {
      // Stop audio stream when disconnected
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      setAudioLevel(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
    };
  }, [isConnected]);

  const startRecording = () => {
    if (!isConnected || !audioStreamRef.current) return;
    
    // Reuse the existing stream
    const stream = audioStreamRef.current;
    
    // Check if MediaRecorder is supported
    if (!MediaRecorder.isTypeSupported) {
      console.error('MediaRecorder is not supported');
      return;
    }
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: mediaRecorder.mimeType });
        // Here you would send the audio to your LiveKit voice agent
        console.log('Audio recorded:', audioBlob);
        // Simulate agent response
        setTimeout(() => {
          setIsAgentSpeaking(true);
          setTimeout(() => setIsAgentSpeaking(false), 2000);
        }, 1000);
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
    } else {
      setIsConnected(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans">
      <SignedIn>
        <div className="absolute top-4 right-4 z-10">
          <UserButton afterSignOutUrl="/" />
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Voice Orb Section */}
            <div className="flex-1 relative bg-gradient-to-br from-black via-purple-900/20 to-black">
              <VoiceBorb 
                audioLevel={audioLevel}
                isActive={isConnected}
                isRecording={isRecording}
                className="w-full h-full"
              />
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-8">
                  {/* Connection Status */}
                  <motion.div
                    className="bg-black/60 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20 shadow-2xl"
                    animate={{
                      scale: isConnected ? [1, 1.05, 1] : 1,
                      opacity: isConnected ? [0.8, 1, 0.8] : 0.6
                    }}
                    transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`} />
                      <span className="text-lg font-semibold">
                        {isConnected ? 'Voice Agent Active' : 'Voice Agent Inactive'}
                      </span>
                    </div>
                  </motion.div>

                  {/* Audio Level Indicator */}
                  {isConnected && (
                    <motion.div
                      className="w-40 h-40 rounded-full border-4 border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                      animate={{
                        scale: 1 + (audioLevel / 100),
                        borderColor: `rgba(255, 41, 117, ${audioLevel / 100})`,
                        boxShadow: `0 0 ${20 + audioLevel}px rgba(255, 41, 117, 0.3)`
                      }}
                    >
                      <Volume2 className="w-10 h-10 text-[#ff2975]" />
                    </motion.div>
                  )}

                  {/* Agent Speaking Indicator */}
                  <AnimatePresence>
                    {isAgentSpeaking && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-[#ff2975]/80 to-[#00FFF1]/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30 shadow-2xl"
                      >
                        <span className="text-lg font-semibold">Agent is speaking...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="w-96 bg-black/40 backdrop-blur-md border-l border-white/10 p-8">
              <div className="space-y-8">
                {/* Connection Controls */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-[#ff2975] to-[#00FFF1] bg-clip-text text-transparent">
                    Voice Controls
                  </h3>
                  
                  <button
                    onClick={toggleConnection}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      isConnected 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <PhoneOff className="w-6 h-6 inline mr-3" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Phone className="w-6 h-6 inline mr-3" />
                        Connect to Voice Agent
                      </>
                    )}
                  </button>

                  {isConnected && (
                    <>
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isMuted}
                        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                          isRecording
                            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25'
                            : 'bg-gradient-to-r from-[#ff2975] to-[#00FFF1] hover:from-[#ff2975]/90 hover:to-[#00FFF1]/90 text-black shadow-lg shadow-purple-500/25'
                        } ${isMuted ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-6 h-6 inline mr-3" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-6 h-6 inline mr-3" />
                            Start Recording
                          </>
                        )}
                      </button>

                      <button
                        onClick={toggleMute}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                          isMuted
                            ? 'bg-red-600/20 border-2 border-red-600 text-red-400 hover:bg-red-600/30'
                            : 'bg-white/10 border-2 border-white/20 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {isMuted ? 'Unmute' : 'Mute'}
                      </button>
                    </>
                  )}
                </div>

                {/* Audio Level */}
                {isConnected && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white/80">Audio Level</h4>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-[#ff2975] to-[#00FFF1] h-3 rounded-full"
                        style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <p className="text-sm text-white/60">{Math.round(audioLevel)}%</p>
                  </div>
                )}

                {/* Session Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white/80">Session Info</h4>
                  <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/10">
                    <p className="text-sm text-white/70">Status: {isConnected ? 'Active' : 'Inactive'}</p>
                    <p className="text-sm text-white/70">Recording: {isRecording ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-white/70">Muted: {isMuted ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white/80">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors border border-white/10">
                      Settings
                    </button>
                    <button className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors border border-white/10">
                      History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="w-full flex flex-col items-center justify-center bg-black">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#ff2975] to-[#00FFF1] bg-clip-text text-transparent">
              Voice Agent Interface
            </h1>
            <p className="text-white/70 mb-8 text-lg">Please sign in to access voice agents</p>
            <div className="bg-gradient-to-r from-[#ff2975] to-[#00FFF1] text-black font-semibold rounded-xl hover:from-[#ff2975]/90 hover:to-[#00FFF1]/90 transition-all px-8 py-4 shadow-lg">
              <button>Sign In</button>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

export default VoiceChatUI;
