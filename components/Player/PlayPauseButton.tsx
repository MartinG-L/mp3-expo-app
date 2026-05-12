import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayerStatus } from "expo-audio";
import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
const PlayPauseButton = React.memo(
  ({
    player,
    fetchingNewMediaUrl,
    togglePlayPause,
    size,
    color,
    iconOffset,
  }: any) => {
    const status = useAudioPlayerStatus(player);
    return (
      <TouchableOpacity
        style={{
          padding: 5,
          width: 40,
          minHeight: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={togglePlayPause}
      >
        {fetchingNewMediaUrl ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MaterialIcons
            name={status?.playing ? "pause" : "play-arrow"}
            size={size}
            color={color}
            style={{ marginLeft: iconOffset ?? 0 }}
          />
        )}
      </TouchableOpacity>
    );
  },
);
export default React.memo(PlayPauseButton);
