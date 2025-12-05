// AudioContext.tsx
import axiosInstance from "@/app/utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

type AudioContextType = {
  currentSong: string | null;
  player: AudioPlayer;
  status: ReturnType<typeof useAudioPlayerStatus>;
  playSong: (SongData: SongData) => void;
  togglePlayPause: () => void;
  handleLike: () => void;
  Thumbnail: string | null;
  seekTo: (seconds: number) => void;
  Duration: number;
  PlayerHeight: number;
  setPlayerHeight:  React.Dispatch<React.SetStateAction<number>>;
  setLikedSongs: React.Dispatch<React.SetStateAction<Set<string>>>;
  likedSongs: Set<string>;
  isLiked: boolean;
  updatePlaylist: boolean;
};

type SongData = {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  isLiked?: boolean;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [Thumbnail, setThumbnail] = useState<string | null>(null);
  const {token, userId} = useAuth();
  const [Duration, setDuration] = useState(0);
  const [PlayerHeight, setPlayerHeight] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSongData, setCurrentSongData] = useState<SongData | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [updatePlaylist, setupdatePlaylist] = useState(false);


  useEffect(() => {
    const loadLikedSongs = async () => {
      try {
        const stored = await AsyncStorage.getItem("likedSongs");
        if(stored){
          const parse: string[] = JSON.parse(stored);
          setLikedSongs(new Set(parse));
        }
      } catch (e: any) {
        console.log(e.error)
      }
    };
    const configureAudio = async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'duckOthers',
        interruptionMode: 'mixWithOthers',
      });
      setAudioReady(true);
    };
    loadLikedSongs();
    configureAudio();
  }, []);


  if(status.didJustFinish){
    player.seekTo(0);
    player.pause();
  }

  const playSong = async (song: SongData) => {
    if (!audioReady) return;

    const liked = likedSongs.has(song.videoId)
    setIsLiked(liked);

    if (currentSongData?.videoId === song.videoId) { 
      togglePlayPause();
      return;
    } 

    try {
      const request = await axiosInstance.get(`/api/audio/newstream?videoId=${encodeURIComponent(song.videoId)}`);
      const mediaUrl = request.data;
      player.replace({ uri: mediaUrl });
      setCurrentSongData(song);
      setThumbnail(song.thumbnail);
      setDuration(song.duration);
      setCurrentSong(song.title);
      player.play();
    } catch (error) {
      console.error("Error al obtener el streamUrl:", error);
    }
  };

  const handleLike = () => {
    if (!currentSongData) return;
    // Cambia el estado visual instantaneamente
    setIsLiked(prev => !prev);

    setLikedSongs(prev => {
      const newSet = new Set(prev);

      if (newSet.has(currentSongData.videoId)) {
        newSet.delete(currentSongData.videoId);
      } else {
        newSet.add(currentSongData.videoId);
      }

      AsyncStorage.setItem("likedSongs", JSON.stringify([...newSet]));
      setupdatePlaylist(true);
      return newSet;
    });   

    // Si habia timeout se cancela aqui
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Creamos timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        const payload = {
          videoId: currentSongData?.videoId,
          title: currentSongData?.title,
          thumbnail: currentSongData?.thumbnail,
          duration: currentSongData?.duration
        };

        const currentlyLiked = likedSongs.has(currentSongData.videoId);

        if (currentlyLiked) {
          await axiosInstance.delete(`/api/albums/likesong?userId=${userId}&videoId=${currentSongData.videoId}`);
        } else {
          await axiosInstance.post(`/api/albums/likesong?userId=${userId}`, payload);
        }
      } catch (error) {
        console.error("Error updating like:", error);
      }
    }, 1000); // esperaramos
  };


  const seekTo = (seconds: number) => {
    if (!player || !currentSong || !token) return;
    const url = `http://192.168.100.6:8080/api/audio/stream-ytdlp?searchSong=${encodeURIComponent(currentSong)}&token=${token}&start=${seconds}`;

    player.replace({ uri: url });
    player.play();
  };

  const togglePlayPause = () => {
    if (!player) return;
    // Lo tenia por lo de ffmpeg + ytdlp que no servia bien el seekTo
    // if(status.currentTime >= Duration){
    //   player.seekTo(0)
    //   player.play();
    //   return
    // } 
    player.playing ? player.pause() : player.play();
  };


  return (
    <AudioContext.Provider value={{
      currentSong,
      player,
      status,
      playSong,
      togglePlayPause,
      Thumbnail,
      seekTo,
      Duration,
      setPlayerHeight,
      PlayerHeight,
      handleLike,
      isLiked,
      setLikedSongs,
      likedSongs,
      updatePlaylist,
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};
