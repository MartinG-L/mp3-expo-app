import axiosInstance from "@/app/utils/axiosInstance";
import { useAudio } from "@/contexts/PlayerContext";
import { showError, showSuccess } from "@/lib/toast";
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as PortalPrimitive from '@rn-primitives/portal';
import { useAudioPlayerStatus } from "expo-audio";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, Platform, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
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
    setListUserPlaylist,
    fetchingNewMediaUrl
  } = useAudio();
  let [newThumbnail, setnewThumbnail] = useState<string | null>(null);
  let [UpdateCurrentSong, setUpdateCurrentSong] = useState<string|null>(null);
  const { width: screenWidth } = Dimensions.get('window');
  const [Volume, setVolume] = useState(0.5);
  const [modalVolumeVisble, setModalVolumeVisble] = useState(false);
  const [modalSaveInAlbumVisible, setModalSaveInAlbumVisible] = useState(false);
  const [stateRepeat, setstateRepeat] = useState(0);
  const thumbSize = Math.min(screenWidth * 0.52, 280);

  const volumeRef = useRef<View>(null);
  const [volumePos, setVolumePos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const { width, height } = useWindowDimensions();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const insets = useSafeAreaInsets();
  const fullScreenY = useSharedValue(1000);
  const [shouldRender, setShouldRender] = useState(false);
  const OFFSCREEN_Y = height + 100;

  const status = useAudioPlayerStatus(player);

  const isSmallPhone = width < 380;  
  const isTablet = width >= 768;
  const isWeb = Platform.OS === "web";
  const isWebDesktop = isWeb && width >= 1024;
  
  const icons = [
    {name: "repeat", color: "#dfdfdfff"}, // default next
    {name: "repeat", color: "#FFD700"}, // repeat infinite
    {name: "repeat-one", color: "#FFD700"}, // repeat one
  ] as const;
   const handleRepeat = () => {
    setstateRepeat((prev) => (prev + 1) % icons.length);
  };

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
      if (req.status === 200) {
        showSuccess("Cambios guardados correctamente");
      }
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
    } catch (err: any) {
      if (err.req?.status === 404) {
        showError("La playlist no existe");
      } else {
        showError("No se pudo eliminar la playlist");
      }
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

  useEffect(() => {
    if(!status.didJustFinish) return;
    const restart = () => {
      player.seekTo(0);
      player.play();
    }

    if(status.didJustFinish && stateRepeat === 0){
      next();
    } else if (status.didJustFinish && stateRepeat === 1) {
      restart()
    } else if (status.didJustFinish && stateRepeat === 2) {
      restart();
      setstateRepeat(0);
    }
  }, [status.didJustFinish]);

  // Usamos useEffect para que no nos spamee el thumbnail, 
  // Nos aseguramos de que solo se imprima cuando realmente cambie el thumbnail
  // Esto pasa porque en nuestro context el status se va actualizando cada segundo
  useEffect(() => {
    setnewThumbnail(Thumbnail);
    setUpdateCurrentSong(currentSongData?.title ?? "");
  }, [Thumbnail, currentSongData]);
  useEffect(() => {
    modalVolumeVisble && measureVolumeBtn();
  }, [modalVolumeVisble, width, height]);
  useEffect(() => {
    player.volume = Volume;
  }, [Volume]);
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
      {/* PLayer fullscreen */}
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
              bottom: 0,
              backgroundColor: "#0e0e0e",
              zIndex: 50,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: insets.top + 12,
              paddingBottom: isSmallPhone ? 35 : 60,

              ...(Platform.OS === "web" && isSmallPhone && {
                marginHorizontal: "auto",
                paddingHorizontal: 5,
              }),
              ...(Platform.OS === "web" && {
                marginHorizontal: "auto",
                paddingHorizontal: isWebDesktop ? 30 : 15,
              }),
            },
            fullScreenStyle,
          ]}
        >
          {/* boton cerrar */}
          <TouchableOpacity
            onPress={() => setIsFullScreen(false)}
            style={{ alignSelf: "center" }}
          >
            <MaterialIcons name="keyboard-arrow-down" size={40} color="#444" />
          </TouchableOpacity>

          {/* Header */}
          <View style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 25,
          }}>
            {/* Thumbnail */}
            <View
              style={{
                width: isSmallPhone 
                ? thumbSize * 1.3 
                : Platform.OS !== "web" 
                ? thumbSize * 1.5 
                : thumbSize * 1.8,
                height: isSmallPhone 
                ? thumbSize * 1.2 
                : Platform.OS !== "web" 
                ? thumbSize * 1.5 
                : thumbSize * 1.8,
                borderRadius: 14,
                overflow: "hidden",
                ...(Platform.OS !== "android" && {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.5,
                  shadowRadius: 18,
                }),
              }}
            >
              <Image
                resizeMode="cover"
                source={newThumbnail ? { uri: newThumbnail } : undefined}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
          </View>
          
          {/* Actions */}
          <View style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: isSmallPhone ? 15 : 40,
            paddingHorizontal: isSmallPhone ? 0 : 32,
            ...(!isWeb && {
              paddingHorizontal: 5,
            }),
          }}>
            {/* Slider progreso + time + current song */}
            <View style={{ width: "100%" }}>
              {/* title song */}
              <View style={{ width: "100%", alignItems: "center", marginBottom: 6 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: "#fff",
                    fontSize: isSmallPhone ? 14 : 18,
                    fontWeight: "700",
                    letterSpacing: 0.2,
                    textAlign: "center",
                  }}
                >
                  {currentSongData?.title}
                </Text>
              </View>
              <Text style={{ color: "#444", fontSize: 16, letterSpacing: 0.5, textAlign: "center", marginBottom: 6 }}>
                {formatTime(status.currentTime)} · {formatTime(Duration)}
              </Text>
              <Slider
                style={{ width: "100%", height: 28 }}
                minimumValue={0}
                maximumValue={Duration}
                value={status.currentTime}
                onSlidingComplete={(value) => player.seekTo(value)}
                minimumTrackTintColor="#FFD700"
                maximumTrackTintColor="#2a2a2a"
                thumbTintColor="#FFD700"
              />
            </View>
          
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: isSmallPhone ? 5 : 20,
                width: "100%",
              }}
            >
              <TouchableOpacity onPress={handleRepeat} style={{ padding: 8 }}>
                <MaterialIcons name={icons[stateRepeat].name} size={26} color={icons[stateRepeat].color} />
              </TouchableOpacity>

              <TouchableOpacity onPress={prev} style={{ padding: 8 }}>
                <MaterialIcons name="skip-previous" size={44} color="#dfdfdf" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                style={{
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: "#FFD700",
                  alignItems: "center", justifyContent: "center",
                  shadowColor: "#FFD700",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
                }}
              > 
                {fetchingNewMediaUrl ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <MaterialIcons name={status?.playing ? "pause" : "play-arrow"} size={42} color="#000" />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => next()} style={{ padding: 8 }}>
                <MaterialIcons name="skip-next" size={44} color="#dfdfdf" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalSaveInAlbumVisible(true)} style={{ padding: 8 }}>
                <MaterialIcons name="add-box" size={26} color="#dfdfdf" />
              </TouchableOpacity>

              {/* Volumen */}
              {/* <TouchableOpacity
                ref={volumeRef}
                onPress={openVolume}
                style={{ padding: 8 }}
              >
                <MaterialIcons
                  name={
                    player.muted || Volume <= 0.01
                      ? "volume-off"
                      : Volume < 0.5
                      ? "volume-down"
                      : "volume-up"
                  }
                  size={26}
                  color={modalVolumeVisble ? "#888" : "#dfdfdf"}
                />
              </TouchableOpacity> */}
            </View>
          </View>
        </Animated.View>
      </PortalPrimitive.Portal>
    )}
      {/* Header Current song */}
      <View style={{
        paddingVertical: 6,
        width: "100%",
        flex: 1,
      }}>
          <TouchableOpacity onPress={()=>{setIsFullScreen(prev => !prev)}}>
            <Text style={{color:"white", fontWeight: "bold", fontSize: 15, textAlign: "center"}}>{currentSongData?.title}</Text>
          </TouchableOpacity>
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
          thumbTintColor={Platform.OS !== "web" ? "#dadadaff" : "transparent"}
        />
      </View>
      {/* THUMBNAIL */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 7}}>
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
                player.muted || Volume <= 0.01
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
                    value <= 0.01 ? player.muted = true : player.muted = false
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

          {/* Repeat */}
          <TouchableOpacity style={{paddingVertical: 5}} onPress={handleRepeat}>
            <MaterialIcons name={icons[stateRepeat].name} size={28} color={icons[stateRepeat].color} />
          </TouchableOpacity >

          <View style={{height: 40, width: 2, backgroundColor: "#797979ff", marginHorizontal: 10}}>
          </View>
          <TouchableOpacity style={{paddingVertical: 5}} onPress={prev}>
            <MaterialIcons name="skip-previous" size={25} color="#dfdfdfff" />
          </TouchableOpacity >
          <TouchableOpacity 
            style={{ padding: 5, width: 40, minHeight: 40, alignItems: "center", justifyContent: "center" }} 
            onPress={togglePlayPause}
          >
            {fetchingNewMediaUrl ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name={status?.playing ? "pause" : "play-arrow"} size={40} color="#dfdfdfff" />
            )}
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
