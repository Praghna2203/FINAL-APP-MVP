import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, Play, Pause, Trash2, Mic2, X, Eye, EyeOff, FileText, Download } from 'lucide-react';
import { Recording } from '../types';

interface Props {
  recordings: Recording[];
  onBack: () => void;
  onDelete: (id: string) => void;
}

const RecordingList: React.FC<Props> = ({ recordings, onBack, onDelete }) => {
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [readingIds, setReadingIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = recordings.filter(r => 
    r.transcript.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
    }).format(ts);
  };

  const handlePlayPause = (e: React.MouseEvent, recording: Recording) => {
    e.stopPropagation();
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = recording.audioUrl;
        audioRef.current.play();
        setPlayingId(recording.id);
      }
    }
  };

  const toggleRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setReadingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    onDelete(id);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col h-full animate-in slide-in-from-left duration-300 overflow-hidden">
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingId(null)} 
        className="hidden" 
      />

      {/* Header */}
      <div className="bg-slate-950/90 backdrop-blur-xl p-6 pb-4 flex flex-col gap-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors active:scale-90"
          >
            <ChevronLeft size={28} />
          </button>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Recordings</h2>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors pointer-events-none" size={20} />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Search within memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-white/10 transition-all text-base"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-700 space-y-4">
            <Mic2 size={48} className="opacity-10" />
            <p className="text-[10px] uppercase tracking-widest font-bold">No fragments found</p>
          </div>
        ) : (
          filtered.map((recording) => {
            const isReading = readingIds.has(recording.id);

            return (
              <div 
                key={recording.id}
                className="bg-slate-900/20 border border-white/5 p-6 rounded-[2.5rem] transition-all relative group overflow-hidden hover:bg-slate-900/40"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                      {formatDate(recording.timestamp)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    
                    {/* Play Button */}
                    <button 
                      onClick={(e) => handlePlayPause(e, recording)}
                      className={`p-3 rounded-full transition-all active:scale-90 ${playingId === recording.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      {playingId === recording.id ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                    </button>

                    {/* Read Button */}
                    <button 
                      onClick={(e) => toggleRead(e, recording.id)}
                      className={`px-4 py-3 rounded-full transition-all active:scale-90 flex items-center gap-2 ${isReading ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      {isReading ? <EyeOff size={18} /> : <Eye size={18} />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">Read</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = document.createElement("a");
                        link.href = recording.audioUrl;
                        link.download = `starvoice-${recording.id}.mp4`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
                    >
                      <Download size={18} />
                    </button>

                    {/* Delete Button */}
                    <button 
                      onClick={(e) => handleDelete(e, recording.id)}
                      className="p-3 rounded-full bg-slate-900/50 text-slate-700 hover:text-red-400 transition-colors active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>
                </div>

                {isReading && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 py-4 border-t border-white/5 mt-4">
                    <p className="text-slate-300 text-sm leading-relaxed font-light italic">
                      "{recording.transcript}"
                    </p>
                  </div>
                )}
                
                {playingId === recording.id && (
                  <div className="mt-4 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 animate-pulse w-full" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecordingList;