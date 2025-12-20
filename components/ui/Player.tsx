import { useAudio } from "@/contexts/PlayerContext";
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Modal, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import VerticalSlider from "../VerticalSlider";
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
  const [Volume, setVolume] = useState(0.5);
  const [modalVolumeVisble, setModalVolumeVisble] = useState(false);

  const volumeRef = useRef<View>(null);
  const [volumePos, setVolumePos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const { width, height } = useWindowDimensions();


  // Usamos useEffect para que no nos spamee el thumbnail, 
  // Nos aseguramos de que solo se imprima cuando realmente cambie el thumbnail
  // Esto pasa porque en nuestro context el status se va actualizando cada segundo
  useEffect(() => {
    player.volume > 0.01 ? player.muted = false : player.muted = true;
    modalVolumeVisble && measureVolumeBtn();
    setnewThumbnail(Thumbnail);
    setUpdateCurrentSong(currentSong);
  }, [Thumbnail, currentSong, width, height, player.volume]);
  // Protegimos que player exista
  if (!player) return null;
  // Formatear tiempo mm:ss
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const measureVolumeBtn = () => {
    volumeRef.current?.measureInWindow((pageX, pageY, w, h) => {
      setVolumePos({
        x: pageX,
        y: pageY,
        w: w,
        h: h,
      });  
    });
  };

  const openVolume = () => {
    volumeRef.current?.measureInWindow((pageX, pageY, w, h) => {
      setVolumePos({
        x: pageX,
        y: pageY,
        w: w,
        h: h,
      });
      setModalVolumeVisble(true);
    });
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
          minimumTrackTintColor="#dadadaff" 
          maximumTrackTintColor="transparent"
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
          
          {/* Volume Button */}
          <TouchableOpacity 
            ref={volumeRef}
            onPress={openVolume}
            style={{padding: 5}}
          >
            <MaterialIcons
              name="volume-up"
              size={28}
              color="#dfdfdfff"
            />
          </TouchableOpacity>
          {modalVolumeVisble && volumePos && (
            <Modal visible={modalVolumeVisble} transparent animationType="fade">
              <Pressable
                style={{flex: 1}}
                onPress={() => setModalVolumeVisble(false)}
              >
              <View style={{
                position: "absolute",
                backgroundColor: "#dfdfdf", 
                left: volumePos.x + volumePos.w / 2 - 15,
                top: volumePos.y - 145,
                borderRadius: 8,
                paddingVertical: 10,
              }}>
                <VerticalSlider
                  height={120}
                  min={0}
                  max={1}
                  value={Volume}
                  onChange={(value) => {
                    setVolume(value);
                    player.volume = value;
                    console.log("Volume set to:", Volume);
                  }}
                />
              </View>
              </Pressable>
            </Modal>
          )}

          <TouchableOpacity style={{padding: 5}}>
            <MaterialIcons name="add-box" size={28} color="#dfdfdfff" />
          </TouchableOpacity>
          <TouchableOpacity style={{padding: 5}} onPress={handleLike}>
            <MaterialIcons name="favorite" size={28} color={isLiked ? "#FFD700" : "white"} />
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
