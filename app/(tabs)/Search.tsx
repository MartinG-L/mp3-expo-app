import { useAudio } from '@/contexts/PlayerContext';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axiosInstance from '../utils/axiosInstance';


export default function Search() {
    interface videoResult { 
        id: number,
        title: string,
        videoId: string,
        urlThumbnail: string
        duration: number
        recordingId?: string
    }

    const [searchSong, setSearchSong] = useState("");
    const [isLoading, setisLoading] = useState(false);
    const [resultList, setresultList] = useState<videoResult[]>([]);
    const {queueAndPlay, currentSongData, PlayerHeight} = useAudio(); 
    const [precise, setPrecise] = useState(false);

    useEffect(() => {
        setresultList([]);
    }, [precise]);

    async function fetchMusic(){
        setisLoading(true);
        try {  
            if(precise){
                const request = await axiosInstance.get(`/api/audio/search/precise?artist=${encodeURIComponent(searchSong)}`);
                console.log(request.data);
                setresultList(request.data);
                return
            } else {
                const request = await axiosInstance.get(`/api/audio/search?searchSong=${encodeURIComponent(searchSong)}`);
                setresultList(request.data);
                console.log(request.data);
                return
            }
        } catch (error) {
            console.log(error);
        } finally {
            setisLoading(false)
        }
        setisLoading(false);
    }
    return (
        <View style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            marginBottom: currentSongData ? PlayerHeight : 0,
        }}>
            <Stack.Screen options={{ title: "Buscar" }} />
            <TextInput
            placeholder="Busca una cancion.."
            value={searchSong}
            onChangeText={setSearchSong}
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            onSubmitEditing={fetchMusic}
            returnKeyType="search"  
            style={{
                borderWidth: 1,
                borderColor: 'gray',
                padding: 10,
                marginTop: 15,
                marginBottom:10,
                borderRadius: 5,
                width: "99%",
                color: 'white',
            }}
            />
           <Pressable
                onPress={() => setPrecise(prev => !prev)}
                style={[
                    styles.toggleButton,
                    precise && styles.toggleButtonActive
                ]}
                >
                <Text
                    selectable={false}
                    style={[
                    styles.toggleText,
                    precise && styles.toggleTextActive
                    ]}
                >
                    {precise ? "Busqueda precisa ✓" : "Busqueda precisa por artista"}
                </Text>
            </Pressable>
            
            <View style={{flex:1, width : "100%"}}>
                
                {isLoading ? (
                    <ActivityIndicator
                        style={{ marginTop: 120 }}
                        size="large"
                        color="#2fa0d4ff"
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
                        {!precise && (
                            <Image
                                source={{ uri: music.urlThumbnail }}
                                style={{ width: 70, height: 60, borderRadius: 5, marginRight: 10 }}
                            />
                        )}
                        <View style={{ flex: 1 }}>
                        <Text style={{ color: "white" }}>{music.title}</Text>
                        </View>
                    </TouchableOpacity>
                    )}
                    initialNumToRender={8}
                    windowSize={5}
                    removeClippedSubviews
                />)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#666",
    backgroundColor: "#111",
    alignSelf: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  toggleText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "700",
  },
  toggleTextActive: {
    color: "#000",
    fontWeight: "700",
  },
});

