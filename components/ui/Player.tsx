import { useAudio } from "@/contexts/PlayerContext";
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
export default function Player() {
  const { 
    currentSong,
    status,
    player,
    togglePlayPause,
    Thumbnail,
    handleLike,
    Duration,
    setPlayerHeight,
    isLiked
  } = useAudio();
  let [newThumbnail, setnewThumbnail] = useState<string | null>(null);
  let [UpdateCurrentSong, setUpdateCurrentSong] = useState<string|null>(null);
  const { width: screenWidth } = Dimensions.get('window');
  // Usamos useEffect para que no nos spamee el thumbnail, 
  // Nos aseguramos de que solo se imprima cuando realmente cambie el thumbnail
  // Esto pasa porque en nuestro context el status se va actualizando cada segundo
  useEffect(() => {
    setnewThumbnail(Thumbnail);
    setUpdateCurrentSong(currentSong);
  }, [Thumbnail, currentSong]);
  // Protegemos que player exista
  if (!player) return null;
  // Formatear tiempo mm:ss
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View 
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setPlayerHeight(height);
      }}
      style={{display: currentSong ? "flex" : "none", backgroundColor: "#121212", borderTopWidth: 2, borderTopColor: "#333"}}>
      {/* Header Current song */}
      <View style={{
        paddingVertical: 6,
        width: "100%",
        flex: 1
      }}>
        <Text style={{color:"white", fontWeight: "bold", fontSize: 15, textAlign: "center"}}>{currentSong}</Text>
      </View>
      {/* SLIDER */}
      <View style={{paddingVertical: 3, display:"flex", flexDirection:"row", alignItems: "center"}}>
        <Slider
        style={{flex: 1}}
          minimumValue={0}
          maximumValue={Duration}
          value={status.currentTime}
          onSlidingComplete={(value) => {
            player.seekTo(value);
          }}
          minimumTrackTintColor="#dadadaff" // color de la barra
          maximumTrackTintColor="#1d1d1dff"
          thumbTintColor="transparent"
        />
      </View>
      {/* THUMBNAIL */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 5}}>
        {/* Thumbnail */}
        <View>
          <Image 
            source={newThumbnail ? { uri: newThumbnail } : undefined}
            style={{ width: 60, height: 60, borderRadius: 3}} 
          />
        </View>
        {/* Segundos*/}
        <View style={{marginLeft: 6}}>
          <Text style={{ color: "#8f8f8fff", paddingRight: 10}}>{formatTime(status.currentTime)}</Text>
          <Text style={{ color: "#8f8f8fff"}}>{formatTime(Duration)}</Text>
        </View>
        {/* Actions */}
        <View style={{
            display: "flex",
            flexDirection: "row",
            alignItems:"center",
            justifyContent: "center",
            flex: 1,
          }}>
          
          <TouchableOpacity style={{padding: 5}}>
            <MaterialIcons name="volume-up" size={28} color="#dfdfdfff" />
          </TouchableOpacity>
          <TouchableOpacity style={{padding: 5}}>
            <MaterialIcons name="add-box" size={28} color="#dfdfdfff" />
          </TouchableOpacity>
          <TouchableOpacity style={{padding: 5}} onPress={handleLike}>
            <MaterialIcons name="favorite" size={28} color={isLiked ? "#fddf32ff" : "white"} />
          </TouchableOpacity>
          <View style={{height: 40, width: 2, backgroundColor: "#797979ff", marginHorizontal: 10}}>
          </View>
          <TouchableOpacity style={{paddingVertical: 5}}>
            <MaterialIcons name="skip-previous" size={25} color="#dfdfdfff" />
          </TouchableOpacity >
          <TouchableOpacity style={{padding: 5}} onPress={togglePlayPause}>
            <MaterialIcons name={status?.playing ? "pause" : "play-arrow"} size={40} color="#dfdfdfff" />
          </TouchableOpacity>
          <TouchableOpacity style={{paddingVertical: 5}}>
            <MaterialIcons name="skip-next" size={25} color="#dfdfdfff" />
          </TouchableOpacity>
        </View>
        {/* Fin actions */}
      </View>
    </View>
  );
}
