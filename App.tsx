
import React, { useState, useEffect } from 'react';
import { Mic, ListMusic, Sparkles, X, Info, Zap, Clock } from 'lucide-react';
import { Recording, AppView } from './types';
import { geminiService } from './services/geminiService';
import { dbService } from './services/dbService';
import StarsBackground from './components/StarsBackground';
import RecordingModal from './components/RecordingModal';
import RecordingList from './components/RecordingList';
import NebulaCanvas from './components/NebulaCanvas';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [nebulaDetail, setNebulaDetail] = useState<Recording | null>(null);

  // Load recordings on mount from IndexedDB
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await dbService.getAllRecordings();
        const processed = stored.map(r => ({
          ...r,
          audioUrl: URL.createObjectURL(r.audioBlob)
        }));
        setRecordings(processed.sort((a, b) => b.timestamp - a.timestamp));
      } catch (err) {
        console.error("Failed to load recordings:", err);
      }
    };
    load();
  }, []);

  const handleStopRecording = async (blob: Blob, mimeType: string) => {
    // Immediately return to home view so the record button reappears
    setIsRecording(false);
    setView('home');
    
    // Process transcription in the background quietly
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result?.toString().split(',')[1];
      if (base64data) {
        const transcript = await geminiService.transcribeAudio(base64data, mimeType);
        
        const newRecording: Recording = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          audioUrl: URL.createObjectURL(blob),
          transcript: transcript,
          duration: 0 
        };

        await dbService.saveRecording(newRecording, blob);
        setRecordings(prev => [newRecording, ...prev]);
      }
    };
  };

  const deleteRecording = async (id: string) => {
    await dbService.deleteRecording(id);
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const formatTimestamp = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(ts);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-slate-200 font-sans">
      <StarsBackground />

      <main className={`relative h-full flex flex-col items-center justify-center p-6 transition-all duration-500 ${view !== 'home' ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
        {/* Glow behind button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />

        <button
          onClick={() => setIsRecording(true)}
          className="group relative w-56 h-56 rounded-full flex items-center justify-center bg-slate-900/40 border border-white/5 shadow-2xl transition-all active:scale-95 z-10 hover:border-white/20"
        >
          {/* Subtle spinning rings */}
          <div className="absolute inset-[-15px] rounded-full border border-cyan-400/5 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-[-30px] rounded-full border border-purple-400/5 animate-[spin_25s_linear_infinite_reverse]" />
          
          <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center bg-slate-950/80 shadow-inner border border-white/5 transition-colors group-hover:bg-slate-900">
            <Mic className="text-white group-hover:text-cyan-400 transition-all duration-500 mb-2 group-hover:scale-110" size={48} />
            <span className="text-[12px] font-bold text-slate-400 group-hover:text-white tracking-[0.3em] uppercase transition-colors">Just Say It</span>
          </div>
        </button>

        {/* Navigation bottom bar */}
        <div className="absolute bottom-12 w-full px-12 flex justify-between items-center z-10 max-w-md mx-auto">
          <button 
            onClick={() => setView('list')}
            className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-white transition-all group"
          >
            <ListMusic size={26} className="group-hover:scale-110 transition-transform opacity-60 group-hover:opacity-100" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Recordings</span>
          </button>

          <button 
            onClick={() => setView('nebula')}
            className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-white transition-all group"
          >
            <Sparkles size={26} className="group-hover:scale-110 transition-transform opacity-60 group-hover:opacity-100" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Nebula</span>
          </button>
        </div>
      </main>

      {isRecording && (
        <RecordingModal onStop={handleStopRecording} onCancel={() => setIsRecording(false)} />
      )}

      {view === 'list' && (
        <RecordingList 
          recordings={recordings} 
          onBack={() => setView('home')} 
          onDelete={deleteRecording} 
        />
      )}

      {view === 'nebula' && (
        <NebulaCanvas 
          recordings={recordings} 
          onBack={() => setView('home')} 
          onSelectRecording={(r) => setNebulaDetail(r)} 
          onSelectSample={() => setShowSampleModal(true)} 
        />
      )}

      {/* Nebula Node Detail Modal */}
      {nebulaDetail && (
        <div className="fixed inset-0 z-[160] bg-black/95 backdrop-blur-2xl flex flex-col p-6 animate-in fade-in zoom-in duration-300">
           <button onClick={() => setNebulaDetail(null)} className="self-end p-2 text-slate-400 hover:text-white mb-4 active:scale-90">
              <X size={32} />
            </button>
            <div className="flex-1 max-w-xl mx-auto w-full flex flex-col overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                    <h2 className="text-2xl font-display font-bold text-white tracking-tight">Nebula Fragment</h2>
                  </div>
                  <div className="text-slate-500 font-mono text-[10px] bg-white/5 px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
                    {formatTimestamp(nebulaDetail.timestamp)}
                  </div>
               </div>

               <div className="flex-1 space-y-6 bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 overflow-y-auto shadow-2xl">
                 <div className="space-y-3">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transcript</h4>
                   <p className="text-slate-200 leading-relaxed italic text-lg font-light">"{nebulaDetail.transcript}"</p>
                 </div>
                 
                 <div className="pt-6 border-t border-white/10 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-purple-500/10 rounded-xl">
                            <Zap size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resonance Mapping</p>
                            <p className="text-sm text-slate-400 leading-relaxed font-light">Future versions will visualize emotional triggers and mental states through color shifts.</p>
                        </div>
                    </div>
                 </div>
               </div>
            </div>
        </div>
      )}

      {/* Sample Nebula Demo Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex flex-col p-6 animate-in fade-in duration-300">
           <button onClick={() => setShowSampleModal(false)} className="self-end p-2 text-slate-400 hover:text-white mb-4 active:scale-90">
              <X size={32} />
            </button>
            <div className="flex-1 max-w-xl mx-auto w-full flex flex-col overflow-hidden">
               <div className="flex items-center gap-3 mb-6">
                 <Sparkles className="text-cyan-400" size={28} />
                 <h2 className="text-2xl font-display font-bold text-white tracking-tight">Future Vision</h2>
               </div>
               
               <div className="flex-1 space-y-6 bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 overflow-y-auto shadow-2xl">
                 <div className="space-y-3">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample Transcript</h4>
                   <p className="text-slate-100 leading-relaxed italic text-xl font-light">
                     "Feeling quite overwhelmed with the current project load. There's a persistent sense of pressure, but also a drive to see it through to completion."
                   </p>
                 </div>

                 <div className="pt-6 border-t border-white/10 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-amber-500/10 rounded-xl">
                            <Zap size={20} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Emotion Detected: Focused Anxiety</p>
                            <p className="text-sm text-slate-300 leading-relaxed font-light">
                              The system identifies high <strong>Engagement</strong> mixed with <strong>Stress</strong> indicators.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 p-5 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-400 leading-relaxed font-light">
                          "If a recording today shares emotional themes with a recording from 25 days ago, a visual connection line will appear between the two nebulae, showing recurring emotional patterns over time."
                        </p>
                    </div>
                 </div>
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
