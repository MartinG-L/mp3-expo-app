import { createContext, useContext } from "react";

type SongData = {
  id: number,
  title: string,
  videoId: string,
  urlThumbnail: string
  duration: number
  recordingId?: string
};

export type AudioState = {
  currentSongData: SongData | null;
  Thumbnail: string | null;
  Duration: number;
  fetchingNewMediaUrl: boolean;
};

type AudioStateContextType = AudioState & {
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
  updateAudioState: (data: Partial<AudioState>) => void;
};

export const useAudioState = () => {
  const context = useContext(AudioStateContext);
  if (!context) throw new Error("useAudioState must be used within AudioProvider");
  return context;
};

export const AudioStateContext = createContext<AudioStateContextType | undefined>(undefined);