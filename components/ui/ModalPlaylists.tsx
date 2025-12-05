import { useAudio } from '@/contexts/PlayerContext';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  songs: Song[]
}

interface ModalPlaylistsProps {
  playListData: PlayListData | null;
  setModalPlaylistVisible: (visible: boolean) => void;
  setLoadingSongsPLaylist: (loading: boolean) => void;
  LoadingSongsPLaylist: boolean;
}

export default function ModalPlaylists({
  playListData,
  setModalPlaylistVisible,
  LoadingSongsPLaylist,
}: ModalPlaylistsProps){
    const {playSong, currentSong, PlayerHeight} = useAudio();

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
          <TouchableOpacity onPress={() => setModalPlaylistVisible(false)} style={{paddingVertical: 3, paddingHorizontal: 10}}>
            <MaterialIcons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{playListData?.name}</Text>
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
  },
  headerTitle: {fontSize: 18, fontWeight: "bold", color:"white" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
});