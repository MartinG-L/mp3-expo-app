import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface ModalPlaylistOptionsProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  headerHeight?: number;
}

export default function ModalPlaylistOptions({
  visible,
  onClose,
  onEdit,
  onDelete,
  headerHeight
}: ModalPlaylistOptionsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const blurOpacity = useSharedValue(0);
  const marginTop = useSharedValue(-200);
  const headerHeightValue = (headerHeight ?? 0) + 10;

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    marginTop: marginTop.value,
  }));

const open = () => {
  blurOpacity.value = withTiming(1, { duration: 200 });
  marginTop.value = withTiming(0, { duration: 250 });
};

const close = () => {
  blurOpacity.value = withTiming(0, { duration: 150 });
  marginTop.value = withTiming(-200, { duration: 200 }, (finished) => {
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
        top: headerHeightValue,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "flex-start",
        zIndex: 999,
      }}
    >
      {/* Fondo blur */}
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: -(headerHeightValue),    
              left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
            },
            blurStyle,
          ]}
        >
          <BlurView
            intensity={100}
            tint="dark"
            style={{ position: "absolute", top: headerHeightValue, left: 0, right: 0, bottom: 0 }}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Top sheet */}
      <Animated.View
        style={[
          {
            backgroundColor: "black",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            borderBottomWidth: 1,
            borderColor: "#222",
            paddingBottom: 10,
          },
          sheetStyle,
        ]}
      >
        {/* Editar */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#222",
          }}
          onPress={() => {
            onEdit();
            close();
          }}
        >
          <Text style={{ color: "white", fontSize: 14 }}>Editar</Text>
          <MaterialIcons name="edit" size={18} color="#969696ff" />
        </TouchableOpacity>

        {/* Eliminar */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
          onPress={() => {
            onDelete();
            close();
          }}
        >
          <Text style={{ color: "#a83737ff", fontSize: 14 }}>Eliminar</Text>
          <MaterialIcons name="delete" size={18} color="#a83737ff" />
        </TouchableOpacity>

        {/* Handle */}
        <View style={{ alignItems: "center", paddingTop: 8 }}>
          <View style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#333",
          }} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}