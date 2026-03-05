import axiosInstance from "@/app/utils/axiosInstance";
import { Text } from '@/components/mytext';
import { useAudio } from "@/contexts/PlayerContext";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface Song {
  id: number;
  title: string,
  videoId: string,
  urlThumbnail: string
  duration: number
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


interface props {
  setModalCreatePlaylistVisible: (visible: boolean) => void;
  modalVisible: boolean;
  setTitlePlaylist:  React.Dispatch<React.SetStateAction<string>>;
  setDescriptionPlaylist:  React.Dispatch<React.SetStateAction<string>>;
  titlePlaylist: string;
  descriptionPlaylist: string;
  onSave: ()=>void;
  isEditingPlaylist: boolean;
  playListData: PlayListData | null;
}

export default function ModalCreatePlaylist({
  setModalCreatePlaylistVisible,
  setTitlePlaylist,
  setDescriptionPlaylist,
  titlePlaylist,
  descriptionPlaylist,
  onSave,
  isEditingPlaylist,
  playListData,
  modalVisible
}:props){

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const {setListUserPlaylist, listUserPlaylist} = useAudio();
  const isWeb = Platform.OS === "web";
  const [isMounted, setisMounted] = useState(false);
  const blurOpacity = useSharedValue(1);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const open = () => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withTiming(1, { duration: 200 });
    blurOpacity.value = withTiming(1, { duration: 200 });
  };

  const close = () => {
    blurOpacity.value = withTiming(0, { duration: 150 });
    opacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(setisMounted)(false);
        runOnJS(setModalCreatePlaylistVisible)(false);
      }
    });
    scale.value = withTiming(0.9, { duration: 150 });
  };

  const modalAnimation = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const IsDisabled =
  !titlePlaylist || 
  (titlePlaylist === playListData?.name && descriptionPlaylist === playListData?.description)

  const createPlaylist = async ()=>{
    if(IsDisabled) return;
    setIsLoading(true)
    try {
      const params = {
        name: titlePlaylist,
        description: descriptionPlaylist,
      }
      const req = await axiosInstance.post("/api/albums/create", params)
      if(req.status == 200){
        const newPlaylist = {
          id: req.data.id,
          name: req.data.name,
          description: req.data.description,
          thumbnail: req.data.thumbnail ?? "",
          created_at: Date.now(),
          is_default: false,
          songs: []
        };

        setListUserPlaylist(prev => {
          const updated = [...prev, newPlaylist];

          AsyncStorage.setItem(
            "listUserPlaylist",
            JSON.stringify(updated)
          );

          return updated;
        });
        onSave();
        setModalCreatePlaylistVisible(false);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  }

  const editPlaylist = async ()=>{
    if (IsDisabled || !playListData?.id) return;
    setIsLoading(true)
    try {
      const params = {
        name: titlePlaylist,
        description: descriptionPlaylist,
        albumId: playListData?.id
      }
      const req = await axiosInstance.put("/api/albums", params)
      if(req.status == 200){
        const updatedData = req.data;

        setListUserPlaylist(prev => {
          const updated = prev.map(p =>
            p.id === playListData.id
              ? { ...p, ...updatedData }
              : p
          );

          AsyncStorage.setItem(
            "listUserPlaylist",
            JSON.stringify(updated)
          );

          return updated;
        });
        onSave();
        setModalCreatePlaylistVisible(false);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  }

  const handleDismissKeyboard = () => {
    if (!isWeb) {
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    if (modalVisible) {
      setisMounted(true);
      requestAnimationFrame(() => {
        open();
      });
    } else if (isMounted) {
      close();
    }
    if (!isEditingPlaylist) {
      setTitlePlaylist("");
      setDescriptionPlaylist("");
    }
  }, [isEditingPlaylist, modalVisible]);


return (
  <>
    {isMounted && (
      <Animated.View
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
        }}
      >
        {/* Fondo borroso */}
        <TouchableWithoutFeedback onPress={close}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
            },
            blurStyle,
          ]}
        >
          <BlurView
            intensity={100}
            tint="dark"
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
            }}
          />
        </Animated.View>
        </TouchableWithoutFeedback>

        {/* Modal principal */}
        <KeyboardAvoidingView
          style={{ justifyContent: "center", marginBottom: 150 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled={!isWeb}
        >
          <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
            <Animated.View
              style={[
                {
                  alignSelf: "center",
                  backgroundColor: "#141414",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#2a2a2a",
                  minWidth: 300,
                  overflow: "hidden",
                },
                modalAnimation,
              ]}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#222",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 3,
                      height: 16,
                      backgroundColor: "#FFD700",
                      borderRadius: 2,
                    }}
                  />
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 }}>
                    {isEditingPlaylist ? "Editar playlist" : "Nueva playlist"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={close}
                  style={{
                    padding: 4,
                    borderRadius: 6,
                    backgroundColor: "#222",
                  }}
                >
                  <MaterialIcons size={15} name="close" color="#888" />
                </TouchableOpacity>
              </View>

              {/* Inputs */}
              <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 10 }}>
                <TextInput
                  placeholder="Título"
                  placeholderTextColor="#444"
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2a2a2a",
                    borderRadius: 10,
                    fontSize: 13,
                    backgroundColor: "#1e1e1e",
                  }}
                  value={titlePlaylist}
                  onChangeText={setTitlePlaylist}
                />

                <TextInput
                  placeholder="Descripción (opcional)"
                  placeholderTextColor="#444"
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "#2a2a2a",
                    borderRadius: 10,
                    fontSize: 13,
                    backgroundColor: "#1e1e1e",
                  }}
                  value={descriptionPlaylist}
                  onChangeText={setDescriptionPlaylist}
                />
              </View>

              {/* Botones */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: "#222",
                  marginTop: 14,
                }}
              >
                <Pressable
                  onPress={close}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#2e2e2e",
                  }}
                >
                  <Text style={{ color: "#666", fontSize: 13, fontWeight: "600" }}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  onPress={isEditingPlaylist ? editPlaylist : createPlaylist}
                  disabled={IsDisabled}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderRadius: 8,
                    backgroundColor: "#FFD700",
                    opacity: IsDisabled ? 0.35 : 1,
                    minWidth: 70,
                    alignItems: "center",
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={{ color: "#000", fontWeight: "700", fontSize: 13 }}>
                      Guardar
                    </Text>
                  )}
                </Pressable>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Animated.View>
    )}
  </>
)};