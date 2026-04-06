import { useAudioPlayerStatus } from "expo-audio";
import { useEffect } from "react";
const PlayerFinishHandler = ({ player, stateRepeat, setstateRepeat, next, setfetchingNewMediaUrl }: any) => {
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!isNaN(status.duration) && status.duration > 0) {
      setfetchingNewMediaUrl(false);
    }
  }, [status.duration]);

  useEffect(() => {
    if (!status.didJustFinish) return;
    const restart = () => {
      player.seekTo(0);
      player.play();
    }
    if (stateRepeat === 0) {
      next();
    } else if (stateRepeat === 1) {
      restart();
    } else if (stateRepeat === 2) {
      restart();
      setstateRepeat(0);
    }
  }, [status.didJustFinish]);

  return null; // no rendezamos nada
};

export default PlayerFinishHandler;