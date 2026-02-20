
import React from 'react';
import { ChevronUp, Info } from 'lucide-react';
import { Recording } from '../types';

interface Props {
  recordings: Recording[];
  onBack: () => void;
  onSelectSample: () => void;
  onSelectRecording: (r: Recording) => void;
}

const NebulaCanvas: React.FC<Props> = ({ recordings, onBack, onSelectSample, onSelectRecording }) => {
  // Generate semi-deterministic positions for nodes for the session
  const nodes = recordings.map((r, i) => ({
    recording: r,
    x: 20 + (Math.sin(i * 1337 + 0.5) * 30 + 30), // 20-80%
    y: 35 + (Math.cos(i * 999 + 0.2) * 25 + 25),  // 35-85% (keep away from top info box)
    color: ['bg-cyan-500', 'bg-purple-500', 'bg-blue-500'][i % 3]
  }));

  return (
    <div className="fixed inset-0 z-40 bg-[#020617] flex flex-col h-full animate-in slide-in-from-top duration-300 overflow-hidden">
      {/* Dynamic Header */}
      <div className="p-6 flex justify-between items-center z-20">
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">Emotional Nebula</h2>
        <button onClick={onBack} className="p-3 bg-slate-900 rounded-full text-slate-400 active:scale-90 transition-transform">
          <ChevronUp size={24} />
        </button>
      </div>

      <div className="relative flex-1 p-6">
        {/* Demo explanation box - Top Positioned */}
        <div className="absolute top-0 left-6 right-6 p-4 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl text-xs text-slate-400 leading-relaxed z-10 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
            <Info size={14} />
            <span>NEBULA SYSTEM v0.1</span>
          </div>
          Each point represents a memory. Click a node to view its transcript. Future versions will map emotional resonance as constellations across your timeline.
        </div>

        {/* Connection line for Sample Nebula demo */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full opacity-30">
          <line 
            x1="50%" y1="30%" x2="50%" y2="85%" 
            stroke="url(#grad1)" strokeWidth="1" strokeDasharray="4 4"
            className="animate-[dash_5s_linear_infinite]"
          />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            </linearGradient>
            <style>{`
              @keyframes dash {
                to { stroke-dashoffset: -20; }
              }
            `}</style>
          </defs>
        </svg>

        {/* The Sample Nebula Node */}
        <div 
          onClick={onSelectSample}
          className="absolute top-[30%] left-1/2 -translate-x-1/2 text-center group cursor-pointer z-10"
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse group-hover:bg-cyan-500/40 transition-colors" />
            <div className="relative w-8 h-8 bg-cyan-400 rounded-full border-2 border-white shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-transform group-hover:scale-110" />
          </div>
          <p className="mt-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Sample Nebula</p>
        </div>

        {/* Real User Recording Nodes */}
        {nodes.map((node) => (
          <div 
            key={node.recording.id}
            onClick={() => onSelectRecording(node.recording)}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center group cursor-pointer z-10"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className={`absolute inset-0 ${node.color}/10 blur-lg rounded-full animate-pulse transition-colors group-hover:${node.color}/30`} />
              <div className={`relative w-4 h-4 ${node.color} rounded-full border border-white/50 shadow-lg transition-transform group-hover:scale-125`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NebulaCanvas;
