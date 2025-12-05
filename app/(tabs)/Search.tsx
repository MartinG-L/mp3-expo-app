import { useAudio } from '@/contexts/PlayerContext';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axiosInstance from '../utils/axiosInstance';

export default function Search() {
    interface videoResult { 
        title: string,
        videoId: string,
        urlThumbnail: string
        duration: number
    }

    const [searchSong, setSearchSong] = useState("");
    const [isLoading, setisLoading] = useState(false);
    const [listMusic, setlistMusic] = useState<videoResult[]>([]);
    const {playSong, currentSong, PlayerHeight} = useAudio(); 

    async function fetchMusic(){
        setisLoading(true);
        try {  
            const request = await axiosInstance.get(`/api/audio/search?searchSong=${encodeURIComponent(searchSong)}`);
            setlistMusic(request.data);
            console.log(request.data)
        } catch (error) {
            console.log(error);
        } finally {
            setisLoading(false)
        }
        setisLoading(false);
    }
    return (
        <View style={{display: 'flex', alignItems: 'center', flex: 1, marginBottom: currentSong ? PlayerHeight : 0 }}>
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
                width: "95%",
                color: 'white',
            }}
            />
            <ScrollView style={{paddingHorizontal: 5, flex: 1, width: "100%"}}>
                {isLoading ? (
                    <View>
                        <ActivityIndicator style={{marginTop: 120}} size="large" color="#2fa0d4ff" />
                    </View>
                ) : (
                <View style={{ width: "100%" }}>
                    {listMusic.map((music) => (
                        <TouchableOpacity
                            key={music.videoId}
                            onPress={() => playSong({
                                videoId: music.videoId,
                                title: music.title,
                                thumbnail: music.urlThumbnail,
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
                                source={{ uri: music.urlThumbnail }} 
                                style={{ width: 70, height: 60, borderRadius: 5, marginRight: 10 }} 
                            />
                            <Text style={{color:'white'}}>{music.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                )}
            </ScrollView>
           
        </View>
    );
}