
import React, { useEffect, useState, useRef } from 'react';
import { X, Square, Mic } from 'lucide-react';

interface Props {
  onStop: (blob: Blob, mimeType: string) => void;
  onCancel: () => void;
}

const RecordingModal: React.FC<Props> = ({ onStop, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    startRecording();
    const interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => {
      clearInterval(interval);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        onStop(audioBlob, finalMimeType);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      onCancel();
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-6 animate-in fade-in duration-500">
      <div className="relative w-full max-w-md bg-[#020617] border border-white/5 rounded-[4rem] p-12 flex flex-col items-center shadow-2xl overflow-hidden">
        {/* Subtle top indicator */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-pulse" />
        
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 p-2 text-slate-600 hover:text-white transition-colors active:scale-90"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-bold">Capturing Session</p>
        </div>

        {/* Minimalist Breathing Visualizer */}
        <div className="relative w-56 h-56 flex items-center justify-center mb-10">
           <div className={`absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl transition-all duration-[2000ms] ${timer % 2 === 0 ? 'scale-125 opacity-60' : 'scale-90 opacity-20'}`} />
           <div className={`w-40 h-40 rounded-full border border-white/5 flex items-center justify-center transition-all duration-[2000ms] ${timer % 2 === 0 ? 'scale-110' : 'scale-95'}`}>
              <div className={`w-32 h-32 rounded-full border border-white/10 flex items-center justify-center transition-all duration-[2000ms] ${timer % 2 === 0 ? 'scale-105 opacity-100' : 'scale-90 opacity-40'}`}>
                 <Mic className="text-white" size={40} />
              </div>
           </div>
        </div>

        <div className="text-4xl font-mono text-white mb-10 tabular-nums font-extralight tracking-tighter">
          {formatTime(timer)}
        </div>

        <div className="flex flex-col items-center gap-10 w-full">
          {/* Large Minimal Stop Button */}
          <button
            onClick={handleStop}
            className="group relative flex items-center justify-center w-24 h-24 bg-white text-black rounded-full transition-all active:scale-90 shadow-2xl hover:bg-slate-100"
          >
            <Square fill="black" size={28} />
            <div className="absolute inset-[-12px] rounded-full border border-white/10 animate-ping opacity-20" />
          </button>
        </div>

        <p className="mt-10 text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">Tap to complete</p>
      </div>
    </div>
  );
};

export default RecordingModal;
