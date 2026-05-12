import axiosInstance from "@/app/utils/axiosInstance";
import { useAudioState } from "@/contexts/AudioStateContext";
import { playerRef, useAudio } from "@/contexts/PlayerContext";
import { showError, showSuccess } from "@/lib/toast";
import { MaterialIcons } from "@expo/vector-icons";
import * as PopoverPrimitive from "@rn-primitives/popover";
import * as PortalPrimitive from "@rn-primitives/portal";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ModalSelectAlbum from "../modals/ModalSelectAlbum";
import PlayerFinishHandler from "../Player/PlayerFinishHandler";
import PlayerSlider from "../Player/PlayerSlider";
import PlayerTime from "../Player/PlayerTime";
import PlayPauseButton from "../Player/PlayPauseButton";
import { PopoverContent, PopoverTrigger } from "../ui/popover";
import VerticalSlider from "../VerticalSlider";

export default function Player() {
  console.log("🎵 Player render");
  const player = playerRef.current;
  const { togglePlayPause, setPlayerHeight, prev, next, setListUserPlaylist } =
    useAudio();
  const { currentSongData, Thumbnail, Duration, fetchingNewMediaUrl } =
    useAudioState();
  const { width: screenWidth } = Dimensions.get("window");
  const [Volume, setVolume] = useState(0.5);
  const [modalSaveInAlbumVisible, setModalSaveInAlbumVisible] = useState(false);
  const [stateRepeat, setstateRepeat] = useState(0);
  const thumbSize = Math.min(screenWidth * 0.52, 280);
  const { width, height } = useWindowDimensions();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const insets = useSafeAreaInsets();
  const fullScreenY = useSharedValue(1000);
  const [shouldRender, setShouldRender] = useState(false);
  const [fullyVisible, setFullyVisible] = useState(false);
  const OFFSCREEN_Y = height + 100;

  // Verificar que player exista
  if (!player) return null;

  const isSmallPhone = width < 380 || height < 700;
  const isTablet = width >= 768;

  const icons = [
    { name: "repeat", color: "#dfdfdfff" }, // default next
    { name: "repeat", color: "#FFD700" }, // repeat infinite
    { name: "repeat-one", color: "#FFD700" }, // repeat one
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
      setListUserPlaylist((prev) =>
        prev.map((playlist) => {
          const shouldHaveSong = albumIds.includes(playlist.id);
          const hasSong = playlist.songs.some(
            (s) => s.videoId === savedSong.videoId,
          );

          // Si la playlist debería tener la canción pero no la tiene, la agregamos
          if (shouldHaveSong && !hasSong) {
            return {
              ...playlist,
              songs: [savedSong, ...playlist.songs],
              songCount: playlist.songCount + 1,
            };
          }

          // Si la playlist no debería tener la canción pero la tiene, la removemos
          if (!shouldHaveSong && hasSong) {
            return {
              ...playlist,
              songs: playlist.songs.filter(
                (s) => s.videoId !== savedSong.videoId,
              ),
              songCount: playlist.songCount - 1,
            };
          }

          return playlist;
        }),
      );
    } catch (err: any) {
      if (!err.response) {
        showError("No se pudo conectar al servidor");
      } else if (err.response?.status === 500) {
        showError("Error interno del servidor");
      } else if (err.response?.status === 404) {
        showError("La playlist no existe");
      } else {
        showError("No se pudo completar la operación");
      }
    }
  };

  const fullScreenStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fullScreenY.value }],
  }));

  useEffect(() => {
    if (isFullScreen) {
      setShouldRender(true);
      fullScreenY.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setFullyVisible)(true);
        }
      });
    } else {
      setFullyVisible(false);
      fullScreenY.value = withTiming(
        OFFSCREEN_Y,
        { duration: 200 },
        (finished) => {
          if (finished) {
            runOnJS(setShouldRender)(false);
          }
        },
      );
    }
  }, [isFullScreen]);

  // Usamos useEffect para que no nos spamee el thumbnail,
  // Nos aseguramos de que solo se imprima cuando realmente cambie el thumbnail
  // Esto pasa porque en nuestro context el status se va actualizando cada segundo
  useEffect(() => {
    if (currentSongData) {
      player.volume = Volume;
    }
  }, [currentSongData]);

  return (
    <View
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setPlayerHeight((prev) => (prev === height ? prev : height));
      }}
      style={{
        display: currentSongData ? "flex" : "none",
        backgroundColor: "#121212",
        borderTopWidth: 2,
        borderTopColor: "#333",
        flex: 1,
      }}
    >
      {/* PlayerFinishHandler cuando carga la cancion se actualiza fetchingNewMediaUrl */}
      <PlayerFinishHandler
        player={player}
        stateRepeat={stateRepeat}
        setstateRepeat={setstateRepeat}
        next={next}
      />
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
                paddingBottom: isSmallPhone ? 35 : 80,
              },
              fullScreenStyle,
            ]}
          >
            {/* boton cerrar */}
            <TouchableOpacity
              onPress={() => setIsFullScreen(false)}
              style={{ alignSelf: "center" }}
            >
              <MaterialIcons
                name="keyboard-arrow-down"
                size={43}
                color="#444"
              />
            </TouchableOpacity>

            {/* Header */}
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: 25,
              }}
            >
              {/* Thumbnail */}
              <View
                style={{
                  width: isSmallPhone ? thumbSize * 1.3 : thumbSize * 1.5,
                  height: isSmallPhone ? thumbSize * 1.2 : thumbSize * 1.5,
                  borderRadius: 14,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.5,
                }}
              >
                <Image
                  resizeMode="cover"
                  source={Thumbnail ? { uri: Thumbnail } : undefined}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </View>

            {/* Actions */}
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: isSmallPhone ? 15 : 40,
                paddingHorizontal: isSmallPhone ? 0 : 32,
                ...(!isSmallPhone && {
                  paddingHorizontal: 5,
                }),
              }}
            >
              {/* Slider progreso + time + current song */}
              <View style={{ width: "100%" }}>
                {/* title song */}
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
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
                {/* time */}
                <PlayerTime
                  player={player}
                  Duration={Duration}
                  variant="full"
                />
                {/* slider */}
                <PlayerSlider player={player} Duration={Duration} />
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
                  <MaterialIcons
                    name={icons[stateRepeat].name}
                    size={26}
                    color={icons[stateRepeat].color}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={prev} style={{ padding: 8 }}>
                  <MaterialIcons
                    name="skip-previous"
                    size={44}
                    color="#dfdfdf"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={togglePlayPause}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: "#FFD700",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#FFD700",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 14,
                    elevation: 10,
                  }}
                >
                  {fetchingNewMediaUrl ? (
                    <ActivityIndicator size="large" color="#000" />
                  ) : (
                    <PlayPauseButton
                      player={player}
                      fetchingNewMediaUrl={fetchingNewMediaUrl}
                      togglePlayPause={togglePlayPause}
                      size={40}
                      color="#000"
                      iconOffset={-4}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => next()} style={{ padding: 8 }}>
                  <MaterialIcons name="skip-next" size={44} color="#dfdfdf" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalSaveInAlbumVisible(true)}
                  style={{ padding: 8 }}
                >
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
      <View
        style={{
          paddingVertical: 6,
          width: "100%",
          flex: 1,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setIsFullScreen((prev) => !prev);
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            {currentSongData?.title}
          </Text>
        </TouchableOpacity>
      </View>
      {/* SLIDER */}
      <View
        style={{
          paddingVertical: 3,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <PlayerSlider player={player} Duration={Duration} />
      </View>
      {/* THUMBNAIL */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingBottom: 7,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setIsFullScreen((prev) => !prev);
            }}
          >
            <Image
              source={Thumbnail ? { uri: Thumbnail } : undefined}
              style={{ width: 60, height: 60, borderRadius: 3 }}
            />
          </TouchableOpacity>
          {/* Segundos*/}
          <View style={{ marginLeft: 6 }}>
            <PlayerTime player={player} Duration={Duration} variant="mini" />
          </View>
        </View>

        {/* Actions */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          {/* Volume Button */}
          <PopoverPrimitive.Root>
            <PopoverTrigger asChild>
              <TouchableOpacity style={{ padding: 5 }}>
                <MaterialIcons
                  name={
                    player.muted || Volume <= 0.01
                      ? "volume-off"
                      : Volume < 0.5
                        ? "volume-down"
                        : "volume-up"
                  }
                  size={28}
                  color="#dfdfdfff"
                />
              </TouchableOpacity>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              sideOffset={10}
              style={{
                backgroundColor: "#222",
                borderWidth: 1,
                borderColor: "#333",
                borderRadius: 5,
                paddingVertical: 10,
              }}
            >
              <VerticalSlider
                height={120}
                min={0}
                max={1}
                value={Volume}
                onChange={(value) => {
                  setVolume(value);
                  value <= 0.01
                    ? (player.muted = true)
                    : (player.muted = false);
                  player.volume = value;
                }}
              />
            </PopoverContent>
          </PopoverPrimitive.Root>

          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => {
              setModalSaveInAlbumVisible(true);
            }}
          >
            <MaterialIcons name="add-box" size={28} color="#dfdfdfff" />
            <ModalSelectAlbum
              visible={modalSaveInAlbumVisible}
              onClose={() => setModalSaveInAlbumVisible(false)}
              onSelect={handleSaveInAlbum}
            />
          </TouchableOpacity>

          {/* Repeat */}
          <TouchableOpacity
            style={{ paddingVertical: 5 }}
            onPress={handleRepeat}
          >
            <MaterialIcons
              name={icons[stateRepeat].name}
              size={28}
              color={icons[stateRepeat].color}
            />
          </TouchableOpacity>

          <View
            style={{
              height: 40,
              width: 2,
              backgroundColor: "#797979ff",
              marginHorizontal: 10,
            }}
          ></View>
          <TouchableOpacity style={{ paddingVertical: 5 }} onPress={prev}>
            <MaterialIcons name="skip-previous" size={25} color="#dfdfdfff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={togglePlayPause}
            style={{
              width: 42,
              height: 42,
              borderRadius: 36,
              backgroundColor: "#FFD700",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#FFD700",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 10,
              marginHorizontal: isSmallPhone ? 5 : 10,
            }}
          >
            {fetchingNewMediaUrl ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <PlayPauseButton
                player={player}
                fetchingNewMediaUrl={fetchingNewMediaUrl}
                togglePlayPause={togglePlayPause}
                size={25}
                color="#000"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: 5 }}
            onPress={() => next()}
          >
            <MaterialIcons name="skip-next" size={25} color="#dfdfdfff" />
          </TouchableOpacity>
        </View>
        {/* Fin actions */}
      </View>
    </View>
  );
}
function AudioState(): {
  currentSongData: any;
  Thumbnail: any;
  Duration: any;
  fetchingNewMediaUrl: any;
} {
  throw new Error("Function not implemented.");
}
