import axiosInstance from "@/app/utils/axiosInstance";
import { Text } from '@/components/mytext';
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

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
  const isWeb = Platform.OS === "web";
  const [isMounted, setisMounted] = useState(false);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  const open = () => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withTiming(1, { duration: 200 });
  };

  const close = () => {
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
    if(IsDisabled) return;
    setIsLoading(true)
    try {
      const params = {
        name: titlePlaylist,
        description: descriptionPlaylist,
        albumId: playListData?.id
      }
      const req = await axiosInstance.put("/api/albums", params)
      if(req.status == 200){
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
  {isMounted &&
    (<Animated.View 
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      {/* Fondo borroso */}
      <TouchableWithoutFeedback onPress={close}>
        <BlurView
          intensity={100}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)'
          }}
        />
      </TouchableWithoutFeedback>

      {/* Modal principal */}
      <KeyboardAvoidingView
        style={{ justifyContent: "center", marginBottom: 150}}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={!isWeb}
      >
        <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
          <Animated.View
            style={[
            {
              alignSelf: "center",
              backgroundColor: "#121212",
              paddingVertical: 15,
              paddingHorizontal: 20,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#333",
              minWidth: 300,
            }, modalAnimation
            ]}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 17, fontWeight: "bold" }}>
                {isEditingPlaylist ? "Editar Playlist" :  "Nueva Playlist!"}
              </Text>
              <TouchableOpacity style={{padding: 5}} onPress={() => setModalCreatePlaylistVisible(false)}>
                <MaterialIcons size={20} name="close" color="white" />
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={{ marginTop: 15 }}>
              <TextInput
                placeholder="Titulo"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 7,
                  color: "white",
                  borderWidth: 1,
                  borderColor: "#777",
                  borderRadius: 3,
                  fontSize: 13
                }}
                value={titlePlaylist}
                onChangeText={setTitlePlaylist}
              />

              <TextInput
                placeholder="Descripcion (opcional)"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                style={{
                  marginTop: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 7,
                  color: "white",
                  borderWidth: 1,
                  borderColor: "#777",
                  borderRadius: 3,
                  fontSize: 13
                }}
                value={descriptionPlaylist}
                onChangeText={setDescriptionPlaylist}
              />
            </View>

            {/* Botones */}
            <View
              style={{
                marginTop: 15,
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Pressable
                style={{
                  backgroundColor: "#3b3b3bff",
                  maxWidth: 100,
                  paddingVertical: 7,
                  paddingHorizontal: 15,
                  alignItems: "center",
                  borderRadius: 3,
                  marginRight: 10,
                }}
                onPress={close}
              >
                <Text style={{ color: "white" }}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "#dfdfdfff" : "white",
                    maxWidth: 100,
                    paddingVertical: 7,
                    paddingHorizontal: 15,
                    alignItems: "center",
                    borderRadius: 3,
                    opacity: IsDisabled ? 0.5 : 1,
                  },
                ]}
                onPress={isEditingPlaylist ? editPlaylist : createPlaylist}
              >
                {isLoading ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={{ color: "black" }}>
                    {isEditingPlaylist ? "Guardar" : "Crear"}
                  </Text>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Animated.View>)}
  </>
 )
}