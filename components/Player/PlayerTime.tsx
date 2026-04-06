import { useAudioPlayerStatus } from "expo-audio";
import React from "react";
import { Text, View } from "react-native";

const PlayerTime = React.memo(({ player, Duration }: { player: any, Duration: number }) => {
  const status = useAudioPlayerStatus(player);
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  return (
    <View style={{ marginLeft: 6 }}>
      <Text style={{ color: "#8f8f8fff", paddingRight: 10 }}>{formatTime(status.currentTime)}</Text>
      <Text style={{ color: "#8f8f8fff" }}>{formatTime(Duration)}</Text>
    </View>
  );
});
export default React.memo(PlayerTime); //PlayerTime