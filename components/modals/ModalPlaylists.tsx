import axiosInstance from '@/app/utils/axiosInstance';
import { useAudioState } from '@/contexts/AudioStateContext';
import { useAudio } from '@/contexts/PlayerContext';
import { showError, showSuccess } from '@/lib/toast';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ModalConfirmDelete from './ModalConfirmDelete';
import ModalPlaylistOptions from './ModalPlaylistOptions';
import ModalSongOptions from './ModalSongOptions';


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
  songCount: number;
  songs: Song[]
}

interface ModalPlaylistsProps {
  playListData: PlayListData | null;
  setplayListData: React.Dispatch<React.SetStateAction<PlayListData | null>>;
  setModalPlaylistVisible: (visible: boolean) => void;
  setLoadingSongsPLaylist: (loading: boolean) => void;
  LoadingSongsPLaylist: boolean;
  isDefault: boolean;
  onDeleted: () => void; 
  setIsEditing:  React.Dispatch<React.SetStateAction<boolean>>;
  setModalCreatePlaylistVisible: (visible: boolean) => void;
}

export default function ModalPlaylists({
  playListData,
  setplayListData,
  setModalPlaylistVisible,
  LoadingSongsPLaylist,
  isDefault,
  onDeleted,
  setIsEditing,
  setModalCreatePlaylistVisible
}: ModalPlaylistsProps){
    const {queueAndPlay, setListUserPlaylist} = useAudio();
    const {currentSongData} = useAudioState();
    const [showConfirmDelete, setshowConfirmDelete] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [showSongOptions, setShowSongOptions] = useState(false);
    const [showPlaylistOptions, setShowPlaylistOptions] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);

    const deletePlaylist = async (playlistId: number)=>{
      if(playListData?.is_default) return;
      try {
        await axiosInstance.delete(`/api/albums/${playlistId}`)
        setListUserPlaylist(prev => {
          const updated = prev.filter(p => p.id !== playlistId);

          AsyncStorage.setItem(
            "listUserPlaylist",
            JSON.stringify(updated)
          );

          return updated;
        });
        setIsEditing(false);
        onDeleted();
      } catch (error) {
        console.log(error)
      }
    }
    
    const deleteSongFromPlaylist = async (songId: number) => {
      try {
        await axiosInstance.delete(`/api/albums/${playListData?.id}/songs/${songId}`);
        setListUserPlaylist(prev => {
          const updated = prev.map(p =>
            p.id === playListData?.id
              ? { ...p, songs: p.songs.filter(s => s.id !== songId), songCount: p.songCount - 1 }
              : p
          );
          AsyncStorage.setItem("listUserPlaylist", JSON.stringify(updated));
          return updated;
        });
        showSuccess("Canción eliminada de la playlist");
      } catch (error) {
        showError("Error al eliminar la canción");
        console.log(error);
      }
    };

    return(
      <View 
      style={{ position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        zIndex: 50,
        flex: 1
      }}>

        {/* Confirmar Borrado */}
        <ModalConfirmDelete 
          visible={showConfirmDelete} 
          onClose={() => setshowConfirmDelete(false)} 
          OnConfirm={()=> {if(playListData?.id){deletePlaylist(playListData?.id)}}}
        />
        {/* Header con flecha */}
        <View style={styles.header}>
    
          <View style={{display: "flex", flexDirection: "row", position: "relative", alignItems:"center"}}>
            <TouchableOpacity onPress={() => {
              setplayListData(null);  
              setModalPlaylistVisible(false)
              setIsEditing(false);
            }} style={{paddingVertical: 3, paddingHorizontal: 10}}>
              <MaterialIcons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{playListData?.name}</Text>
          </View>

          {isDefault ? null : (
            <TouchableOpacity
              style={{ paddingVertical: 3, paddingHorizontal: 20 }}
              onPress={() => setShowPlaylistOptions(true)}
            >
              <MaterialIcons name="more-vert" size={20} color="white" />
            </TouchableOpacity>
          )}
          
        </View>

        {/* PLAYLIST OPTIONS */}
        <ModalPlaylistOptions
          headerHeight={headerHeight}
          visible={showPlaylistOptions}
          onClose={() => setShowPlaylistOptions(false)}
          onEdit={() => {
            setIsEditing(true);
            setModalCreatePlaylistVisible(true);
          }}
          onDelete={() => setshowConfirmDelete(true)}
        />
        {/* FIN PLAYLIST OPTIONS */}
        
        {/* Modal Option Song */}
        <ModalSongOptions
          visible={showSongOptions}
          song={selectedSong}
          onClose={() => setShowSongOptions(false)}
          onDelete={(song) => {
            deleteSongFromPlaylist(song.id);
          }}
          onSetThumbnail={(song) => {
          }}
        />

        {/* Contenido */}
        <FlatList
          data={playListData?.songs ?? []}
          keyExtractor={(item) => item.videoId}
          style={{ paddingHorizontal: 5, flex: 1, width: "100%", marginTop: 15 }}
          contentContainerStyle={{ width: "100%" }}
          ListEmptyComponent={
            LoadingSongsPLaylist ? (
              <ActivityIndicator style={{ marginTop: 120 }} size="large" color="#2fa0d4ff" />
            ) : null
          }
          renderItem={({ item: music, index }) => (
            <TouchableOpacity
              onPress={() => queueAndPlay(playListData?.songs ?? [], index)}
              onLongPress={()=>{
                setSelectedSong(music);
                setShowSongOptions(true);
              }}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                marginVertical: 5,
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 7,
                backgroundColor: "#111",
                borderRadius: 5,
                width: "100%",
              }}
            >
              {currentSongData?.title === music.title && (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderBottomWidth: 2,
                    borderColor: "#FFD700",
                    borderRadius: 2,
                  }}
                />
              )}
              <Image
                source={{ uri: music.urlThumbnail }}
                style={{ width: 70, height: 60, borderRadius: 5, marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white" }}>{music.title}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

      </View>
    )
}


const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 15,
    borderBottomColor: "#ccc",
    justifyContent: "space-between"
  },
  headerTitle: {fontSize: 18, fontWeight: "bold", color:"white" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});
