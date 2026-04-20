import { useAudioState } from "@/contexts/AudioStateContext";
import { useAudioPlayerStatus } from "expo-audio";
import { useEffect } from "react";

const PlayerFinishHandler = ({ player, stateRepeat, setstateRepeat, next }: any) => {
  const status = useAudioPlayerStatus(player);
  const {updateAudioState, fetchingNewMediaUrl} = useAudioState();


  useEffect(() => {
    // agregamos fetchingNewMediaUrl para verificar que se haya cambiado en el context y si no lo cambiamos aqui, el estado se quedaria en true y no se podria reproducir la cancion
    if (!isNaN(status.duration) && status.duration > 0 && fetchingNewMediaUrl) {
      updateAudioState({ fetchingNewMediaUrl: false });
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