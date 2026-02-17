// AudioContext.tsx
import axiosInstance from "@/app/utils/axiosInstance";
import { AudioPlayer, setAudioModeAsync, useAudioPlayer } from "expo-audio";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type AudioContextType = {
  player: AudioPlayer;
  queueAndPlay: (queue: SongData[],  index: number) => void;
  next: () => void;
  prev: () => void;
  togglePlayPause: () => void;
  Thumbnail: string | null;
  Duration: number;
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
  currentSongData: SongData | null;
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
  const [audioReady, setAudioReady] = useState(false);
  const [Thumbnail, setThumbnail] = useState<string | null>(null);
  const [Duration, setDuration] = useState(0);
  const [PlayerHeight, setPlayerHeight] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentSongData, setCurrentSongData] = useState<SongData | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [listUserPlaylist, setListUserPlaylist] = useState<PlaylistsUser[]>([]);
  const [updatePlaylist, setupdatePlaylist] = useState(false);
  const [queue, setQueue] = useState<SongData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(0);

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


  useEffect(() => {
    const song: SongData = queue[currentIndex];
    if(song){
      playCurrentSong(song);
    }
  }, [currentIndex, queue]);



  const next = async () => {
    console.log("Next song");
    if(queue.length === 0) return;
    setCurrentIndex((i)=>{
      const nextIndex = i + 1;
      return nextIndex < queue.length ? nextIndex : 0;
    })
  };

  const prev = () => {
    console.log("Prev song");
    if (queue.length === 0) return;
    setCurrentIndex((i) => {
      const prevIndex = i - 1;
      return prevIndex >= 0 ? prevIndex : queue.length - 1;
    });
  };

  const playCurrentSong = async (song: SongData) => {
    if (!audioReady) return;
    let finalSong = song;
    let mediaUrl = "";
    try {
      if(!song.videoId){
        const searchSong = await axiosInstance.get("/api/audio/search?searchSong=" + encodeURIComponent(song.title) + "&fromSearchPrecise=true");
        finalSong = {
          ...song,
          videoId: searchSong.data[0].videoId,
          duration: searchSong.data[0].duration,
          urlThumbnail: searchSong.data[0].urlThumbnail,
        };
        const request = await axiosInstance.get(`/api/audio/newstream?videoId=${encodeURIComponent(finalSong.videoId)}`);
        mediaUrl = request.data;
      } else {
        const request = await axiosInstance.get(`/api/audio/newstream?videoId=${encodeURIComponent(song.videoId)}`);
        mediaUrl = request.data;
      }
      player.replace({ uri: mediaUrl });
      setCurrentSongData(finalSong);
      setThumbnail(finalSong.urlThumbnail);
      setDuration(finalSong.duration);
      player.play();
    } catch (error) {
      console.error("Error al obtener el streamUrl:", error);
    }
  };

  // Creamos indentificador logico ya que en quequeAndPlay cuando usamos preciseSearch
  // no existe el videoId todavia
  const getSongKey = (song: SongData) =>
    song.videoId ??
    song.recordingId ??
    song.title.toLowerCase();

  const queueAndPlay = (newQueue: SongData[], index: number) => {
    const clickedSong = newQueue[index];

    if (
      currentSongData &&
      getSongKey(currentSongData) === getSongKey(clickedSong)
    ) {
      togglePlayPause();
      return;
    }

    setQueue(newQueue);
    setCurrentIndex(index);
  };

  // const handleLike = () => {
  //   if (!currentSongData) return;
    
  //   const wasLiked = likedSongs.has(currentSongData.videoId);
  //   const nowLiked = !wasLiked;
    
  //   // Cambia el estado visual instantáneamente
  //   setIsLiked(nowLiked);

  //   // Actualiza likedSongs
  //   setLikedSongs(prev => {
  //     const newSet = new Set(prev);

  //     if (wasLiked) {
  //       newSet.delete(currentSongData.videoId);
  //     } else {
  //       newSet.add(currentSongData.videoId);
  //     }

  //     AsyncStorage.setItem("likedSongs", JSON.stringify([...newSet]));
  //     return newSet;
  //   });

  //   // Actualiza las playlists
  //   setListUserPlaylist(prev => {
  //     const updatedPlaylists = prev.map(playlist => {
  //       if (playlist.is_default) {
  //         if (nowLiked) {
  //           // Agregar cancion si no existe
  //           const songExists = playlist.songs.some(s => s.videoId === currentSongData.videoId);
  //           if (!songExists) {
  //             const newSong = {
  //               id: currentSongData.id,
  //               title: currentSongData.title,
  //               videoId: currentSongData.videoId,
  //               urlThumbnail: currentSongData.urlThumbnail,
  //               duration: currentSongData.duration
  //             };
  //             return {
  //               ...playlist,
  //               songs: [newSong,...playlist.songs]
  //             };
  //           }
  //         } else {
  //           // Eliminar la cancion
  //           return {
  //             ...playlist,
  //             songs: playlist.songs.filter(s => s.videoId !== currentSongData.videoId)
  //           };
  //         }
  //       }
  //       return playlist;
  //     });

  //     // Actualizamos el AsyncStorage
  //     AsyncStorage.setItem("listUserPlaylist", JSON.stringify(updatedPlaylists));
      
  //     return updatedPlaylists;
  //   });

  //   // Si había timeout se cancela aquí
  //   if (timeoutRef.current) clearTimeout(timeoutRef.current);

  //   // Creamos timeout para sincronizar con el backend
  //   timeoutRef.current = setTimeout(async () => {
  //     try {
  //       const payload = {
  //         videoId: currentSongData?.videoId,
  //         title: currentSongData?.title,
  //         thumbnail: currentSongData?.urlThumbnail,
  //         duration: currentSongData?.duration
  //       };

  //       if (nowLiked) {
  //         await axiosInstance.post(`/api/albums/likesong?userId=${userId}`, payload);
  //       } else {
  //         await axiosInstance.delete(`/api/albums/likesong?userId=${userId}&videoId=${currentSongData.videoId}`);
  //       }
  //     } catch (error) {
  //       console.error("Error updating like:", error);
  //     }
  //   }, 1000);
  // };


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
      player,
      queueAndPlay,
      next,
      prev,
      togglePlayPause,
      Thumbnail,
      Duration,
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
      currentSongData,
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
