import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

type Props = {
  player: any;
  Duration: number;
  variant: "mini" | "full";
};

const PlayerTime = ({ player, Duration, variant = "mini" }: Props) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      setTime(player.currentTime || 0);
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const current = formatTime(time);
  const total = formatTime(Duration);
   if (variant === "mini") {
    return (
      <View style={{ marginLeft: 6 }}>
        <Text style={{ color: "#8f8f8f", paddingRight: 10 }}>
          {current}
        </Text>
        <Text style={{ color: "#8f8f8f" }}>
          {total}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginLeft: 6 }}>
      <Text
        style={{
          color: "#444",
          fontSize: 16,
          textAlign: "center",
          letterSpacing: 0.5,
          marginBottom: 30,
        }}
      >
        {current} · {total}
      </Text>
    </View>
  );
};

export default React.memo(PlayerTime);