// AudioContext.tsx
import axiosInstance from "@/app/utils/axiosInstance";
import { showSessionExpired } from "@/lib/toast";
import { AudioPlayer, setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

import { NativeModules } from 'react-native';
import { AudioState, AudioStateContext } from "./AudioStateContext";
const { NewPipeModule } = NativeModules;


type AudioContextType = {
  queueAndPlay: (queue: SongData[],  index: number) => void;
  next: () => void;
  prev: () => void;
  togglePlayPause: () => void;
  PlayerHeight: number;
  setPlayerHeight:  React.Dispatch<React.SetStateAction<number>>;
  setLikedSongs: React.Dispatch<React.SetStateAction<Set<string>>>;
  setQueue: React.Dispatch<React.SetStateAction<SongData[]>>;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setTabBarHeight: React.Dispatch<React.SetStateAction<number>>;
  tabBarHeight: number;
  likedSongs: Set<string>;
  isLiked: boolean;
  updatePlaylist: boolean;
  setListUserPlaylist: React.Dispatch<React.SetStateAction<PlaylistsUser[]>>;
  listUserPlaylist: PlaylistsUser[]
};

type SongData = {
  id: number,
  title: string,
  videoId: string,
  urlThumbnail: string
  duration: number
  recordingId?: string
};

interface PlaylistsUser {
  id: number;
  name: String;
  description: String;
  thumbnail: String;
  created_at: number;
  is_default: boolean;
  songs: SongData[];
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);


export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("🎧 AudioProvider render");
  const player = useAudioPlayer();
  playerRef.current = player;
  const [audioReady, setAudioReady] = useState(false);
  const [PlayerHeight, setPlayerHeight] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [listUserPlaylist, setListUserPlaylist] = useState<PlaylistsUser[]>([]);
  const [updatePlaylist, setupdatePlaylist] = useState(false);
  const [queue, setQueue] = useState<SongData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const { token, logout } = useAuth();
  const [audioState, setAudioState] = useState<AudioState>({
    currentSongData: null,
    Thumbnail: null,
    Duration: 0,
    fetchingNewMediaUrl: false,
  });
  const updateAudioState = useCallback((data: Partial<AudioState>) => {
    setAudioState(prev => ({ ...prev, ...data }));
  }, []);

  const authTokenRef = useRef(token ?? "");
  useEffect(() => {
    authTokenRef.current = token ?? "";
  }, [token]);

  useEffect(() => {
    player.remove();
  }, [token]);

  useEffect(() => {
    const configureAudio = async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'duckOthers',
        interruptionMode: 'mixWithOthers',
      });
      setAudioReady(true);
    };
    configureAudio();
  }, []);

  const queueRef = useRef<SongData[]>([]);
  const currentIndexRef = useRef(0);
  const audioReadyRef = useRef(false);
  const currentSongDataRef = useRef<SongData | null>(null);
  const audioStateValue = useMemo(() => ({
    ...audioState,
    setAudioState,
    updateAudioState,
  }), [audioState]);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { audioReadyRef.current = audioReady; }, [audioReady]);
  useEffect(() => { currentSongDataRef.current = audioState.currentSongData; }, [audioState.currentSongData]);

  const playCurrentSong = useCallback(async (song: SongData) => {
    if (!audioReadyRef.current) return;
    let finalSong = song;
    updateAudioState({ fetchingNewMediaUrl: true });
    try {
      const requestMediaUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/audio/stream?videoId=${encodeURIComponent(finalSong.videoId)}&token=${encodeURIComponent(authTokenRef.current)}`;
      const check = await fetch(requestMediaUrl, { method: 'HEAD' });
      if (check.status === 401) {
        logout();
        router.replace('/auth/login');
        showSessionExpired("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return;
      }
      if (!song.videoId) {
        const searchSong = await axiosInstance.get("/api/audio/search?searchSong=" + encodeURIComponent(song.title) + "&fromSearchPrecise=true");
        finalSong = {
          ...song,
          videoId: searchSong.data[0].videoId,
          duration: searchSong.data[0].duration,
          urlThumbnail: searchSong.data[0].urlThumbnail,
        };
      }
      const mediaUrl = await NewPipeModule.getAudioUrl(finalSong.videoId);
      player.replace({ uri: mediaUrl });
      setAudioState(prev => ({
        ...prev,
        currentSongData: finalSong,
        Thumbnail: finalSong.urlThumbnail,
        Duration: finalSong.duration,
        fetchingNewMediaUrl: false,
      }));
      player.play();
    } catch (error) {
      console.error("Error al obtener el streamUrl:", error);
      updateAudioState({ fetchingNewMediaUrl: false });
    } 
  }, [logout]);

  useEffect(() => {
    const song = queueRef.current[currentIndex];
    if (song) playCurrentSong(song);
  }, [currentIndex, playCurrentSong]);

  const next = useCallback(() => {
    console.log("Next song");
    if (queueRef.current.length === 0) return;
    setCurrentIndex((i) => {
      const nextIndex = i + 1;
      return nextIndex < queueRef.current.length ? nextIndex : 0;
    });
  }, []);

  const prev = useCallback(() => {
    console.log("Prev song");
    if (queueRef.current.length === 0) return;
    setCurrentIndex((i) => {
      const prevIndex = i - 1;
      return prevIndex >= 0 ? prevIndex : queueRef.current.length - 1;
    });
  }, []);

  const getSongKey = useCallback((song: SongData) =>
    song.videoId ?? song.recordingId ?? song.title.toLowerCase()
  , []);

  const queueAndPlay = useCallback((newQueue: SongData[], index: number) => {
    const player = playerRef.current;
    if (!player) return;
    
    const clickedSong = newQueue[index];
    
    if (
      currentSongDataRef.current &&
      getSongKey(currentSongDataRef.current) === getSongKey(clickedSong)
    ) {
      player.playing ? player.pause() : player.play();
      return;
    }

    // Actualizar el ref inmediatamente para que el efecto no duplique
    queueRef.current = newQueue;

    setQueue(newQueue);

    if (currentIndexRef.current === index) {
      playCurrentSong(clickedSong);
    } else {
      setCurrentIndex(index);
    }
  }, [getSongKey, playCurrentSong]);

  const togglePlayPause = useCallback(() => {
    player.playing ? player.pause() : player.play();
  }, []);

  const state: Record<string, unknown> = { 
    audioState, 
    queue, 
    currentIndex, 
    PlayerHeight, 
    isLiked, 
    likedSongs, 
    updatePlaylist, 
    tabBarHeight, 
    listUserPlaylist 
  };

  const value = useMemo(() => ({
    queueAndPlay,
    next,
    prev,
    togglePlayPause,
    setPlayerHeight,
    PlayerHeight,
    isLiked,
    setLikedSongs,
    likedSongs,
    updatePlaylist,
    setQueue,
    setCurrentIndex,
    setTabBarHeight,
    tabBarHeight,
    setListUserPlaylist,
    listUserPlaylist,
    currentSongDataRef,
  }), [
    queueAndPlay,
    next,
    prev,
    togglePlayPause,
    PlayerHeight,
    isLiked,
    likedSongs,
    updatePlaylist,
    tabBarHeight,
    listUserPlaylist,
    currentSongDataRef,
  ]);

  return (
    <AudioStateContext.Provider value={audioStateValue}>
      <AudioContext.Provider value={value}>
        {children}
      </AudioContext.Provider>
    </AudioStateContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};

export const playerRef = { current: null as AudioPlayer | null };
