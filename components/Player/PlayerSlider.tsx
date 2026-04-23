import Slider from "@react-native-community/slider";
import { useAudioPlayerStatus } from "expo-audio";
import { NativeModules, Platform } from "react-native";
const { MediaSessionModule } = NativeModules;
const PlayerSlider = ({ player, Duration,  }: { player: any, Duration: number }) => {
  const status = useAudioPlayerStatus(player);
  return (
    <>
      <Slider
        style={{ flex: 1 }}
        minimumValue={0}
        maximumValue={Duration}
        value={status.currentTime}
        onSlidingComplete={(value) => {
          player.seekTo(value);
          MediaSessionModule.updatePosition(value)
            .catch((e: any) => console.error(e));
        }}
        minimumTrackTintColor="#dadadaff"
        maximumTrackTintColor={Platform.OS !== "web" ? "#555" : "transparent"}
        thumbTintColor={Platform.OS !== "web" ? "#dadadaff" : "transparent"}
      />
    </>
  );
};

export default PlayerSlider;