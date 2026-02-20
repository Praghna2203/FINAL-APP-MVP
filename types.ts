
export interface Recording {
  id: string;
  timestamp: number;
  audioUrl: string;
  transcript: string;
  duration: number;
}

export type AppView = 'home' | 'list' | 'nebula';

export interface EmotionAnalysis {
  primary: string;
  secondary: string;
  intensity: number;
  patterns: string[];
}
