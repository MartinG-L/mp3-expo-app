import { Text } from '@/components/mytext';
import ModalCreatePlaylist from '@/components/ui/ModalCreatePlaylist';
import ModalPlaylists from '@/components/ui/ModalPlaylists';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import axiosInstance from '../utils/axiosInstance';


export default function HomeScreen() {
  interface Playlists {
    id: number;
    name: String;
    description: String;
    thumbnail: String;
    createdAt: number;
    isDefault: boolean;
  }

  interface Song {
    id: number;
    title: string,
    videoId: string,
    urlThumbnail: string
    duration: number
  }

  interface PlayListData {
    id: number;
    name: String;
    description: String;
    thumbnail: String;
    created_at: number;
    is_default: boolean;
    songs: Song[];
  }

  const {logout, userId, token} = useAuth();
  const {setQueue, currentSong, PlayerHeight} = useAudio(); 
  const [playLists, setplayLists] = useState<Playlists[]>([]);
  const [playListData, setplayListData] = useState<PlayListData | null>(null);
  const [ModalPlaylistVisible, setModalPlaylistVisible] = useState(false);
  const [loadingSongsPlaylist, setLoadingSongsPlaylist] = useState(false);
  const [ModalCreatePlaylistVisible, setModalCreatePlaylistVisible] = useState(false);
  const [titlePlaylist, settitlePlaylist] = useState("");
  const [descriptionPlaylist, setDescriptionPlaylist] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [modalTitlePlaylist, setModalTitlePlaylist] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function fetchPlaylist(){
    try {    
      const request = await axiosInstance.get(`/api/albums?userId=${Number(userId)}`)
      setplayLists(request.data)
    } catch (error: any) {
      if(!error.response){
        setErrorMessage("No se pudo conectar al servidor.");
      } else if (error.response.status >= 500){
        setErrorMessage("Error del servidor. Intente mas tarde.");
      } else {
        setErrorMessage("Ocurrio un error inesperado.");
      }
    }
  }

  useEffect(() => {
    if (userId && token) {
      fetchPlaylist();
    }
  }, [userId, token]);

  async function handlePlaylistModal(playlist: Playlists) {
    setLoadingSongsPlaylist(true);
    setModalPlaylistVisible(true);
    setIsDefault(playlist.isDefault);
    setModalTitlePlaylist(playlist.name.toString());
    // Info para el modal crear
    settitlePlaylist(playlist.name.toString())
    setDescriptionPlaylist(playlist.description.toString());
    try { 
      const req = await axiosInstance.get(`/api/albums/${playlist.id}/songs`);
      const playlistSongs = req.data.map((song: any) => ({
        id: song.id,
        title: song.title,
        videoId: song.videoId,
        urlThumbnail: song.thumbnail,
        duration: song.duration,
      }));
      setplayListData({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        created_at: playlist.createdAt,
        is_default: playlist.isDefault,
        songs: playlistSongs || []
      });
    } catch (e: any) {
      console.log(e)
    } finally {
      setLoadingSongsPlaylist(false);
    }
  }

  return (
      <View style={{
        display: 'flex',
        flex: 1,
        marginBottom: currentSong ? PlayerHeight : 0,
      }}>

      {/* Header "Tus Playlist" */}
      <View style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
        justifyContent: "space-between",
        paddingHorizontal: 20
      }}>

        <Text style={{
          color:"white",
          fontSize: 20,
          fontWeight: "bold",
        }}>Tus Playlists</Text>
        <TouchableOpacity style={{padding: 5}} onPress={()=>setModalCreatePlaylistVisible(true)}>
          <MaterialIcons name="add" size={22} color="white" />
        </TouchableOpacity>

      </View>
      {/* PLAYLISTS */}
      {errorMessage ? (
        <View style={{paddingHorizontal: 20, marginTop: 10}}>
          <Text style={{color: "red"}}>{errorMessage}</Text>
        </View>
      ) : (
      <ScrollView>
        <View style={{display: "flex", flex: 1, width: "100%"}}>
      
          {playLists?.map((playlist)=>(
            <TouchableOpacity key={playlist.id} style={{
              backgroundColor: "#111",
              paddingHorizontal: 20,
              paddingVertical: 20,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12
            }} onPress={()=>handlePlaylistModal(playlist)}>
              <View style={{backgroundColor: "gray", width: 70, height: 70, marginRight: 10}}></View>
              <View style={{display: "flex", flexDirection: "column", gap: 5}}>
                <Text style={{color:"white", fontWeight: "bold", fontSize: 17}}>{playlist.name}</Text>
                <Text style={{color:"white", fontSize: 12}}>{playlist.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
        </View>
      </ScrollView>)}
      {/* Modal playlist */}
      {ModalPlaylistVisible && 
        (<ModalPlaylists
          playListData={playListData}
          setModalPlaylistVisible={setModalPlaylistVisible}
          setLoadingSongsPLaylist={setLoadingSongsPlaylist}
          LoadingSongsPLaylist={loadingSongsPlaylist}
          isDefault={isDefault}
          title={modalTitlePlaylist}
          onDeleted={() => {
            fetchPlaylist();
            setModalPlaylistVisible(false);
            setplayListData(null);
          }}
          setIsEditing={setIsEditing}
          setModalCreatePlaylistVisible={setModalCreatePlaylistVisible}
        ></ModalPlaylists>)
      }
      {/* Modal CreatePlaylist */}
      {ModalCreatePlaylistVisible && 
        (<ModalCreatePlaylist
          setModalCreatePlaylistVisible={setModalCreatePlaylistVisible}
          setTitlePlaylist={settitlePlaylist}
          setDescriptionPlaylist={setDescriptionPlaylist}
          titlePlaylist={titlePlaylist}
          descriptionPlaylist={descriptionPlaylist}
          onSave={() => {
            fetchPlaylist();
            setModalPlaylistVisible(false);
          }}
          isEditingPlaylist={isEditing}
          playListData={playListData}
          modalVisible={ModalCreatePlaylistVisible}
        />)
      }

    </View>
  );
}
