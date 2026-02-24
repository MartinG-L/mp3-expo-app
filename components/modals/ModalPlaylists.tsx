import axiosInstance from '@/app/utils/axiosInstance';
import { useAudio } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as PopoverPrimitive from '@rn-primitives/popover';
import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PopoverContent, PopoverTrigger } from '../ui/popover';
import ModalConfirmDelete from './ModalConfirmDelete';


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
  songs: Song[]
}

interface ModalPlaylistsProps {
  playListData: PlayListData | null;
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
  setModalPlaylistVisible,
  LoadingSongsPLaylist,
  isDefault,
  onDeleted,
  setIsEditing,
  setModalCreatePlaylistVisible
}: ModalPlaylistsProps){
    const {queueAndPlay, setListUserPlaylist, currentSongData} = useAudio();
    const [showConfirmDelete, setshowConfirmDelete] = useState(false);

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
    

    return(
      <View style={{ position: "absolute",
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
              setModalPlaylistVisible(false)
              setIsEditing(false);
            }} style={{paddingVertical: 3, paddingHorizontal: 10}}>
              <MaterialIcons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{playListData?.name}</Text>
          </View>

          {/* POPOVER OPTIONS */}
          {isDefault ? null : 
          <PopoverPrimitive.Root>

            <PopoverTrigger asChild>
              <TouchableOpacity style={{paddingVertical: 3, paddingHorizontal: 20}}>
                <MaterialIcons name="more-vert" size={20} color="white" />
              </TouchableOpacity>
            </PopoverTrigger>
            
            
            <PopoverContent
              side="bottom"
              sideOffset={10}
              align="end"
              alignOffset={15}
              style={{
                backgroundColor: "#111",
                flexDirection: "column",
                overflow: "hidden", 
                borderWidth: 1,
                borderColor: "#222",
                paddingHorizontal: 10,
                borderRadius: 10
              }}>
                {/* Botones */}
                <PopoverPrimitive.Close asChild>
                  <TouchableOpacity 
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 7,
                    display:"flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    borderBottomColor: "#333",
                    borderWidth: 1,
                    alignItems: "center",
                  }} onPress={()=>{
                      setIsEditing(true);
                      setModalCreatePlaylistVisible(true);  
                    }}>
                    <Text style={{color:"white", fontWeight:"light", fontSize: 12}}>Editar</Text>
                    <MaterialIcons name="edit" size={18} color="#969696ff" />
                  </TouchableOpacity>
                </PopoverPrimitive.Close>

                <PopoverPrimitive.Close asChild>
                  <TouchableOpacity 
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 7,
                    display:"flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }} onPress={()=>setshowConfirmDelete(true)}>
                    <Text style={{color:"white", fontWeight:"light", fontSize: 12}}>Eliminar</Text>
                    <MaterialIcons name="delete" size={18} color="#a83737ff" />
                  </TouchableOpacity>
                </PopoverPrimitive.Close>
                {/* FIN BOTONES */}
              </PopoverContent>

          </PopoverPrimitive.Root>}
          {/* FIN POPOVER OPTIONS */}
          
        </View>

        {/* Contenido */}
        <ScrollView style={{paddingHorizontal: 5, flex: 1, width: "100%", marginTop: 15}}>
          {LoadingSongsPLaylist ? (
            <View>
                <ActivityIndicator style={{marginTop: 120}} size="large" color="#2fa0d4ff" />
            </View>
          ) : (
          <View style={{ width: "100%"}}>
            {playListData?.songs.map((music, index) => (
              <TouchableOpacity
                key={music.videoId}
                onPress={() => queueAndPlay(playListData.songs, index)}
                style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "row",
                    marginVertical: 5, 
                    alignItems: 'center',
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
                <View style={{flex: 1}}>
                  <Text style={{color:"white"}}>{music.title}</Text>    
                </View>
            </TouchableOpacity>
            ))}
          </View>
          )}
        </ScrollView>

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
