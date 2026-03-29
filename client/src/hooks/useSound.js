import { useEffect, useState } from "react";
import soundManager from "../utils/soundManager";

export default function useSound() {
  const [muted, setMuted] = useState(soundManager.isMuted());

  useEffect(() => {
    const unsub = soundManager.subscribe((s) => setMuted(s.muted));
    return unsub;
  }, []);

  return {
    muted,
    toggleMute: () => soundManager.toggleMuted(),
    setMute: (v) => soundManager.setMuted(v),
    setVolume: (v) => soundManager.setVolume(v),
    playClick: () => soundManager.play("click"),
    playXP: () => soundManager.play("xp"),
    playSuccess: () => soundManager.play("success"),
    playBadge: () => soundManager.play("badge"),
    playLevelUp: () => soundManager.play("levelup"),
    playCombo: (sequence) => soundManager.playCombo(sequence),
    playReward: (level) => soundManager.playReward(level),
  };
}
