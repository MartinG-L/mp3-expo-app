import axiosInstance from "@/app/utils/axiosInstance";
import { useAudio } from "@/contexts/PlayerContext";
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as PortalPrimitive from '@rn-primitives/portal';
import { useAudioPlayerStatus } from "expo-audio";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Modal, Platform, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import VerticalSlider from "../VerticalSlider";
import ModalSelectAlbum from "../modals/ModalSelectAlbum";

export default function Player() {
  const { 
    currentSongData,
    player,
    togglePlayPause,
    Thumbnail,
    Duration,
    setPlayerHeight,
    isLiked,
    prev,
    next,
    PlayerHeight,
    tabBarHeight,
    setListUserPlaylist
  } = useAudio();
  let [newThumbnail, setnewThumbnail] = useState<string | null>(null);
  let [UpdateCurrentSong, setUpdateCurrentSong] = useState<string|null>(null);
  const { width: screenWidth } = Dimensions.get('window');
  const [Volume, setVolume] = useState(0.5);
  const [modalVolumeVisble, setModalVolumeVisble] = useState(false);
  const [modalSaveInAlbumVisible, setModalSaveInAlbumVisible] = useState(false);

  const volumeRef = useRef<View>(null);
  const [volumePos, setVolumePos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const { width, height } = useWindowDimensions();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const insets = useSafeAreaInsets();
  const fullScreenY = useSharedValue(1000);
  const [shouldRender, setShouldRender] = useState(false);
  const OFFSCREEN_Y = height + 100;

  const status = useAudioPlayerStatus(player);
  

  const handleSaveInAlbum = async (playlistsId: number[]) => {
    if (!currentSongData?.videoId) return;

    const albumIds = playlistsId.map(Number);

    setModalSaveInAlbumVisible(false);

    const payload = {
      song: {
        videoId: currentSongData.videoId,
        title: currentSongData.title,
        thumbnail: currentSongData.urlThumbnail,
        duration: currentSongData.duration,
      },
      albumIds,
    };

    try {
      const req = await axiosInstance.post(`/api/albums/add/song`, payload);
      const savedSong = {
        id: req.data.id,         
        videoId: req.data.videoId,
        title: req.data.title,
        urlThumbnail: req.data.thumbnail,
        duration: req.data.duration,
      };
      setListUserPlaylist(prev =>
        prev.map(playlist => {
          const shouldHaveSong = albumIds.includes(playlist.id);
          const hasSong = playlist.songs.some(
            s => s.videoId === savedSong.videoId
          );

          if (shouldHaveSong && !hasSong) {
            return {
              ...playlist,
              songs: [savedSong, ...playlist.songs],
            };
          }

          if (!shouldHaveSong && hasSong) {
            return {
              ...playlist,
              songs: playlist.songs.filter(
                s => s.videoId !== savedSong.videoId
              ),
            };
          }

          return playlist;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fullScreenStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fullScreenY.value }],
  }));

  useEffect(() => {
    if (isFullScreen) {
      setShouldRender(true);
      fullScreenY.value = withTiming(0, { duration: 300 });
    } else {
      fullScreenY.value = withTiming(OFFSCREEN_Y, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [isFullScreen]);

  // Usamos useEffect para que no nos spamee el thumbnail, 
  // Nos aseguramos de que solo se imprima cuando realmente cambie el thumbnail
  // Esto pasa porque en nuestro context el status se va actualizando cada segundo
  useEffect(() => {
    modalVolumeVisble && measureVolumeBtn();
    setnewThumbnail(Thumbnail);
    setUpdateCurrentSong(currentSongData?.title ?? "");
  }, [Thumbnail, currentSongData, width, height, player.volume, Volume]);
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
      style={{display: currentSongData ? "flex" : "none", backgroundColor: "#121212", borderTopWidth: 2, borderTopColor: "#333", flex: 1}}>
      {/* FullScreen */}
      {shouldRender && (
      <PortalPrimitive.Portal name="root">
        <Animated.View
          pointerEvents={isFullScreen ? "auto" : "none"}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: tabBarHeight + insets.bottom + PlayerHeight,
              backgroundColor: "black",
              zIndex: 50,
            }, fullScreenStyle
          ]}
        >
          {/* Boton cerrar */}
          <TouchableOpacity
            onPress={() => setIsFullScreen(false)}
            style={{
              position: "absolute",
              top: 20,
              alignSelf: "center",
              zIndex: 10,
              padding: 20,
            }}
          >
            <MaterialIcons
              name="keyboard-arrow-down"
              size={40}
              color="#dfdfdfff"
            />
          </TouchableOpacity>

          {/* Thumbnail grande */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              resizeMode="contain"
              source={newThumbnail ? { uri: newThumbnail } : undefined}
              style={{
                flex: 1,
                width: "100%",
              }}
            />
          </View>
        </Animated.View>
      </PortalPrimitive.Portal>
      )}
      {/* Header Current song */}
      <View style={{
        paddingVertical: 6,
        width: "100%",
        flex: 1
      }}>
        <Text style={{color:"white", fontWeight: "bold", fontSize: 15, textAlign: "center"}}>{currentSongData?.title}</Text>
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
          maximumTrackTintColor={Platform.OS !== "web" ? "#555" : "transparent"}
          thumbTintColor={Platform.OS !== "web" ? "#555" : "transparent"}
        />
      </View>
      {/* THUMBNAIL */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 5}}>
        <TouchableOpacity onPress={()=>{
          setIsFullScreen(prev => !prev) 
        }}>
          <Image 
            source={newThumbnail ? { uri: newThumbnail } : undefined}
            style={{ width: 60, height: 60, borderRadius: 3}} 
          />
        </TouchableOpacity>
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
              name={
                Volume === 0 || Volume <= 0.03 
                ? "volume-off" 
                : Volume < 0.5 
                ? "volume-down" 
                : "volume-up"
              }
              size={28}
              color={modalVolumeVisble ? "#888" : "#dfdfdfff"}
            />
          </TouchableOpacity>
          {modalVolumeVisble && volumePos && (
            <Modal visible={modalVolumeVisble} transparent animationType="none">
              <Pressable
                style={{flex: 1}}
                onPress={() => setModalVolumeVisble(false)}
              >
              <View style={{
                position: "absolute",
                backgroundColor: "#222", 
                left: volumePos.x + volumePos.w / 2 - 15,
                top: volumePos.y - 145,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "#333",
                paddingVertical: 10,
              }}>
                <VerticalSlider
                  height={120}
                  min={0}
                  max={1}
                  value={Volume}
                  onChange={(value) => {
                    setVolume(value);
                    value <= 0.03 ? player.muted = true : player.muted = false
                    player.volume = value;
                  }}
                />
              </View>
              </Pressable>
            </Modal>
          )}

          <TouchableOpacity style={{padding: 5}} onPress={()=>{setModalSaveInAlbumVisible(true)}}>
            <MaterialIcons name="add-box" size={28} color="#dfdfdfff" />
            <ModalSelectAlbum 
              visible={modalSaveInAlbumVisible}
              onClose={() => setModalSaveInAlbumVisible(false)}
              onSelect={handleSaveInAlbum} 
            />
          </TouchableOpacity>
          <View style={{height: 40, width: 2, backgroundColor: "#797979ff", marginHorizontal: 10}}>
          </View>
          <TouchableOpacity style={{paddingVertical: 5}} onPress={prev}>
            <MaterialIcons name="skip-previous" size={25} color="#dfdfdfff" />
          </TouchableOpacity >
          <TouchableOpacity style={{padding: 5}} onPress={togglePlayPause}>
            <MaterialIcons name={status?.playing ? "pause" : "play-arrow"} size={40} color="#dfdfdfff" />
          </TouchableOpacity>
          <TouchableOpacity style={{paddingVertical: 5}} onPress={()=> next()}>
            <MaterialIcons name="skip-next" size={25} color="#dfdfdfff" />
          </TouchableOpacity>
        </View>
        {/* Fin actions */}
      </View>
    </View>
  );
}
