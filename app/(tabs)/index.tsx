import ModalCreatePlaylist from '@/components/ui/ModalCreatePlaylist';
import ModalPlaylists from '@/components/ui/ModalPlaylists';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import axiosInstance from '../utils/axiosInstance';


export default function HomeScreen() {
  interface Playlists {
    id: number;
    name: String;
    description: String;
    thumbnail: String;
    created_at: number;
  }

  interface Song {
    id: number;
    title: string;
    videoId: string;
    thumbnail: string;
    duration: number;
  }

  interface PlayListData {
    id: number;
    name: String;
    description: String;
    thumbnail: String;
    created_at: number;
    songs: Song[];
  }

  const {logout, userId, token, saveToken, saveUserId} = useAuth();
  const {status, player} = useAudio(); 
  const [playLists, setplayLists] = useState<Playlists[]>([]);
  const [playListData, setplayListData] = useState<PlayListData | null>(null);
  const [ModalPlaylistVisible, setModalPlaylistVisible] = useState(false);
  const [loadingSongsPlaylist, setLoadingSongsPlaylist] = useState(false);
  const [ModalCreatePlaylistVisible, setModalCreatePlaylistVisible] = useState(false);
  

  async function fetchPlaylist(){
    const request = await axiosInstance.get(`/api/albums?userId=${Number(userId)}`)
    setplayLists(request.data)
  }

  useEffect(() => {
    if (userId && token) {
      fetchPlaylist();
    }
  }, []);

  function logoutHandler(){
    status?.isLoaded ? player?.remove() : "";
    logout();
  }

  async function handlePlaylistModal(playlist: Playlists) {
    setLoadingSongsPlaylist(true);
    setModalPlaylistVisible(true);
    try { 
      const req = await axiosInstance.get(`/api/albums/${playlist.id}/songs`);
      const playlistSongs = req.data;
      console.log(playlistSongs);
      setplayListData({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        created_at: playlist.created_at,
        songs: playlistSongs || []
      });
    } catch (e: any) {
      console.log(e)
    } finally {
      setLoadingSongsPlaylist(false);
    }
  }

  return (
    <>
    <Stack.Screen options={{ 
      title: "Inicio",
      headerTitle: "Bienvenido, Martin!",
      headerRight: ()=> <Button onPress={logoutHandler} title="Cerrar sesion" />
    }} />

    <View style={{flex: 1}}>

      {/* Header "Tus Playlist" */}
      <View style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        justifyContent: "space-between",
        paddingHorizontal: 20
      }}>

        <Text style={{
          color:"white",
          fontSize: 20,
          fontWeight: "bold",
        }}>Tus Playlists</Text>
        <TouchableOpacity style={{padding: 3}} onPress={()=>setModalCreatePlaylistVisible(true)}>
          <MaterialIcons name="add" size={22} color="white" />
        </TouchableOpacity>

      </View>
      {/* PLAYLISTS */}
      <ScrollView>
        <View style={{display: "flex", flex: 1, width: "100%", marginTop: 20}}>
      
          {playLists?.map((playlist)=>(
            <TouchableOpacity key={playlist.id} style={{
              backgroundColor: "#111",
              paddingHorizontal: 20,
              paddingVertical: 20,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }} onPress={()=>handlePlaylistModal(playlist)}>
              <View style={{backgroundColor: "gray", width: 80, height: 80, marginRight: 10}}></View>
              <View style={{display: "flex", flexDirection: "column", gap: 5}}>
                <Text style={{color:"white", fontWeight: "bold", fontSize: 18}}>{playlist.name}</Text>
                <Text style={{color:"white", fontSize: 13}}>{playlist.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
        </View>
      </ScrollView>
      {/* Modal playlist */}
      {ModalPlaylistVisible && 
        (<ModalPlaylists
          playListData={playListData}
          setModalPlaylistVisible={setModalPlaylistVisible}
          setLoadingSongsPLaylist={setLoadingSongsPlaylist}
          LoadingSongsPLaylist={loadingSongsPlaylist}
        ></ModalPlaylists>)
      }
      {/* Modal CreatePlaylist */}
      {ModalCreatePlaylistVisible && 
        (<ModalCreatePlaylist setModalCreatePlaylistVisible={setModalCreatePlaylistVisible} />)
      }

    </View>
    </>

  );
}
