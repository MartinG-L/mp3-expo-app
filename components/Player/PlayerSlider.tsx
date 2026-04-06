import Slider from "@react-native-community/slider";
import { useAudioPlayerStatus } from "expo-audio";
import { Platform, Text } from "react-native";
const PlayerSlider = ({ player, Duration, isFullScreen }: { player: any, Duration: number, isFullScreen: boolean }) => {
  const status = useAudioPlayerStatus(player);
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  return (
    <>
      {isFullScreen && (
        <Text style={{ color: "#444", fontSize: 16, letterSpacing: 0.5, textAlign: "center", marginBottom: 30 }}>
          {formatTime(status.currentTime)} · {formatTime(Duration)}
        </Text>
      )}
      <Slider
        style={{ flex: 1 }}
        minimumValue={0}
        maximumValue={Duration}
        value={status.currentTime}
        onSlidingComplete={(value) => player.seekTo(value)}
        minimumTrackTintColor="#dadadaff"
        maximumTrackTintColor={Platform.OS !== "web" ? "#555" : "transparent"}
        thumbTintColor={Platform.OS !== "web" ? "#dadadaff" : "transparent"}
      />
    </>
  );
};

export default PlayerSlider;