import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

 interface videoResult { 
    id: number,
    title: string,
    videoId: string,
    urlThumbnail: string
    duration: number
    recordingId?: string
}

interface ModalPreciseSearchSongsProps {
    isLoading: boolean;
    resultList: videoResult[];
    precise: boolean;
    queueAndPlay: (songs: videoResult[], index: number) => void;
    currentSongData: { title: string } | null;
    setIsModalVisible: (visible: boolean) => void;
    artist: { id: number, name: string } | null;
}

export default function ModalPreciseSearchSongs({ resultList, precise, queueAndPlay, currentSongData, setIsModalVisible, artist, isLoading }: ModalPreciseSearchSongsProps) {

    return (
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
        {/* Header con flecha */}
        <View style={styles.header}>
          <View style={{display: "flex", flexDirection: "row", position: "relative", alignItems:"center"}}>
            <TouchableOpacity onPress={() => {
              setIsModalVisible(false);
            }} style={{paddingVertical: 3, paddingHorizontal: 10}}>
              <MaterialIcons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{artist?.name}</Text>
        </View>

          
        </View>
            {isLoading ? (
                <ActivityIndicator
                    style={{ marginTop: 120 }}
                    size="large"
                    color="#FFD700"
                />
            ) : (
            <FlatList
                data={resultList}
                keyExtractor={(item, index) =>
                    (precise ? item.recordingId : item.videoId) ?? index.toString()
                }
                contentContainerStyle={{
                    paddingHorizontal: 5,
                }}
                renderItem={({ item: music, index }) => (
                <TouchableOpacity
                    onPress={() => queueAndPlay(resultList, index)}
                    style={{
                    flexDirection: "row",
                    marginVertical: 5,
                    alignItems: "center",
                    paddingVertical: precise ? 13 : 10,
                    paddingHorizontal: 7,
                    backgroundColor: "#111",
                    borderRadius: 5,
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
                    <View style={{ flex: 1 }}>
                    <Text style={{ color: "white" }}>{music.title}</Text>
                    </View>
                </TouchableOpacity>
                )}
                initialNumToRender={8}
                windowSize={5}
                maxToRenderPerBatch={8}
                removeClippedSubviews
            />)}
        </View>
    )
}

const styles = StyleSheet.create({
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
