import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

type Props = {
  player: any;
  Duration: number;
};

const PlayerTime = ({ player, Duration }: Props) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      setTime(player.currentTime || 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [player]);

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={{ marginLeft: 6 }}>
      <Text style={{ color: "#8f8f8fff", paddingRight: 10 }}>
        {formatTime(time)}
      </Text>
      <Text style={{ color: "#8f8f8fff" }}>
        {formatTime(Duration)}
      </Text>
    </View>
  );
};

export default React.memo(PlayerTime);