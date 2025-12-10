import axiosInstance from '@/app/utils/axiosInstance';
import { useAudio } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Popover, PopoverContent, PopoverTrigger } from './popover';

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
  is_default: boolean;
  songs: Song[]
}

interface ModalPlaylistsProps {
  playListData: PlayListData | null;
  setModalPlaylistVisible: (visible: boolean) => void;
  setLoadingSongsPLaylist: (loading: boolean) => void;
  LoadingSongsPLaylist: boolean;
  isDefault: boolean;
  title: string
  onDeleted: () => void; 
  setIsEditing:  React.Dispatch<React.SetStateAction<boolean>>;
  setModalCreatePlaylistVisible: (visible: boolean) => void;
}

export default function ModalPlaylists({
  playListData,
  setModalPlaylistVisible,
  LoadingSongsPLaylist,
  isDefault,
  title,
  onDeleted,
  setIsEditing,
  setModalCreatePlaylistVisible
}: ModalPlaylistsProps){
    const {playSong, currentSong, PlayerHeight} = useAudio();

    const deletePlaylist = async ()=>{
      console.log("onDeleted prop:", onDeleted);
      if(playListData?.is_default) return;
      try {
        await axiosInstance.delete(`/api/albums/${playListData?.id}`)
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
        flex: 1,
        marginBottom: currentSong ? PlayerHeight : 0
      }}>

        {/* Header con flecha */}
        <View style={styles.header}>
    
          <View style={{display: "flex", flexDirection: "row", position: "relative", alignItems:"center"}}>
            <TouchableOpacity onPress={() => {
              setModalPlaylistVisible(false)
              setIsEditing(false);
            }} style={{paddingVertical: 3, paddingHorizontal: 10}}>
              <MaterialIcons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          {/* POPOVER OPTIONS */}
          {isDefault ? null : 
          <Popover>

            <PopoverTrigger style={{paddingVertical: 3, paddingHorizontal: 20}}>
              <MaterialIcons name="more-vert" size={20} color="white" />
            </PopoverTrigger>

           
            <PopoverContent
            style={{
              backgroundColor: "#121212",
              position:"absolute",
              flexDirection: "column",
              right: 0,
              top: Platform.OS === 'android' ? 143 : 0,
              minWidth: 120,
              overflow: "hidden", 
              borderWidth: 1,
              borderColor: "#222"
            }}>
              <TouchableOpacity 
               style={{
                paddingVertical: 12,
                paddingHorizontal: 5,
                display:"flex",
                flexDirection: "row",
                justifyContent: "space-around",
                borderBottomColor: "#333",
                borderWidth: 1,
               }} onPress={()=>{
                  setIsEditing(true);
                  setModalCreatePlaylistVisible(true);  
                }}>
                <Text style={{color:"white", fontWeight:"light", fontSize: 12}}>Editar</Text>
                <MaterialIcons name="edit" size={18} color="#969696ff" />
              </TouchableOpacity>

              <TouchableOpacity 
              style={{
                paddingVertical: 12,
                paddingHorizontal: 5,
                display:"flex",
                flexDirection: "row",
                justifyContent: "space-around"
              }} onPress={deletePlaylist}>
                <Text style={{color:"white", fontWeight:"light", fontSize: 12}}>Eliminar</Text>
                <MaterialIcons name="delete" size={18} color="#a83737ff" />
              </TouchableOpacity>

            </PopoverContent>

          </Popover>}
          {/* FIN POPOVER OPTIONS */}
          
        </View>

        {/* Contenido */}
        <ScrollView style={{paddingHorizontal: 5, flex: 1, width: "100%", marginTop: 15}}>
          {LoadingSongsPLaylist ? (
            <View>
                <ActivityIndicator style={{marginTop: 120}} size="large" color="#2fa0d4ff" />
            </View>
          ) : (
          <View style={{ width: "100%" }}>
            {playListData?.songs.map((music) => (
              <TouchableOpacity
                key={music.videoId}
                onPress={() => playSong({
                  videoId: music.videoId,
                  title: music.title,
                  thumbnail: music.thumbnail,
                  duration: music.duration,
                })}
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
                <Image 
                  source={{ uri: music.thumbnail }} 
                  style={{ width: 70, height: 60, borderRadius: 5, marginRight: 10 }} 
                />
                <Text style={{color:'white'}}>{music.title}</Text>
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