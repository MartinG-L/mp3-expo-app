import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface Song {
  id: number;
  title: string,
  videoId: string,
  urlThumbnail: string
  duration: number
}

interface ModalSongOptionsProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onDelete: (song: Song) => void;
  onSetThumbnail: (song: Song) => void;
}

export default function ModalSongOptions({
  visible,
  song,
  onClose,
  onDelete,
  onSetThumbnail,
}: ModalSongOptionsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const blurOpacity = useSharedValue(0);
  const translateY = useSharedValue(300);

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const open = () => {
    blurOpacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 250 });
  };

  const close = () => {
    blurOpacity.value = withTiming(0, { duration: 150 });
    translateY.value = withTiming(300, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setIsMounted)(false);
        runOnJS(onClose)();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      requestAnimationFrame(() => open());
    } else if (isMounted) {
      close();
    }
  }, [visible]);

  if (!isMounted) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: "flex-end",
        zIndex: 999,
      }}
    >
      {/* Fondo blur */}
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
            intensity={60}
            tint="dark"
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          {
            backgroundColor: "#141414",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderTopWidth: 1,
            borderColor: "#222",
            paddingBottom: 34,
          },
          sheetStyle,
        ]}
      >
        {/* Handle */}
        <View style={{
          alignItems: "center",
          paddingTop: 10,
          paddingBottom: 4,
        }}>
          <View style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#333",
          }} />
        </View>

        {/* Título canción */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#222",
        }}>
          <Text style={{ color: "#888", fontSize: 12 }} numberOfLines={1}>
            {song?.title}
          </Text>
        </View>

        {/* Establecer como portada */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#222",
          }}
          onPress={() => {
            if (song) onSetThumbnail(song);
            close();
          }}
        >
          <MaterialIcons name="image" size={20} color="white" />
          <Text style={{ color: "white", fontSize: 14 }}>Establecer como portada</Text>
        </TouchableOpacity>

        {/* Eliminar de playlist */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
          onPress={() => {
            if (song) onDelete(song);
            close();
          }}
        >
          <MaterialIcons name="delete" size={20} color="#a83737ff" />
          <Text style={{ color: "#a83737ff", fontSize: 14 }}>Eliminar de playlist</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}