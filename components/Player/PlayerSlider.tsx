import Slider from "@react-native-community/slider";
import { useAudioPlayerStatus } from "expo-audio";
import { Platform } from "react-native";
const PlayerSlider = ({ player, Duration,  }: { player: any, Duration: number }) => {
  const status = useAudioPlayerStatus(player);
  return (
    <>
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