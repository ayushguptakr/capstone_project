const SOUND_KEY = "ecoquest:sound:muted";
const DEFAULT_VOLUME = 0.28;
const MIN_INTERVAL_MS = 110;
const SAME_SOUND_COOLDOWN_MS = 170;
const MAX_CONCURRENT = 3;

const SOUND_CONFIG = {
  click: { src: "/assets/sounds/click.mp3", volume: 0.22 },
  xp: { src: "/assets/sounds/xp.mp3", volume: 0.24 },
  success: { src: "/assets/sounds/success.mp3", volume: 0.26 },
  levelup: { src: "/assets/sounds/levelup.mp3", volume: 0.3 },
  badge: { src: "/assets/sounds/badge.mp3", volume: 0.28 },
};

class SoundManager {
  constructor() {
    this.sounds = {};
    this.listeners = new Set();
    this.lastPlayedAt = {};
    this.lastGlobalPlayAt = 0;
    this.activeCount = 0;
    this.globalVolume = DEFAULT_VOLUME;
    this.muted = localStorage.getItem(SOUND_KEY) === "1";
    this.preload();
  }

  preload() {
    Object.entries(SOUND_CONFIG).forEach(([key, cfg]) => {
      const audio = new Audio(cfg.src);
      audio.preload = "auto";
      audio.volume = this.resolveVolume(cfg.volume);
      this.sounds[key] = audio;
      // Fire-and-forget preload hint.
      audio.load();
    });
  }

  resolveVolume(baseVolume) {
    const v = typeof baseVolume === "number" ? baseVolume : this.globalVolume;
    return Math.max(0, Math.min(1, v * this.globalVolume));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit() {
    this.listeners.forEach((cb) => cb({ muted: this.muted, volume: this.globalVolume }));
  }

  isMuted() {
    return this.muted;
  }

  setMuted(next) {
    this.muted = Boolean(next);
    localStorage.setItem(SOUND_KEY, this.muted ? "1" : "0");
    this.emit();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  setVolume(next) {
    this.globalVolume = Math.max(0, Math.min(1, Number(next) || DEFAULT_VOLUME));
    Object.entries(SOUND_CONFIG).forEach(([key, cfg]) => {
      if (this.sounds[key]) this.sounds[key].volume = this.resolveVolume(cfg.volume);
    });
    this.emit();
  }

  canPlay(name) {
    const now = Date.now();
    const last = this.lastPlayedAt[name] || 0;
    if (now - this.lastGlobalPlayAt < MIN_INTERVAL_MS) return false;
    if (now - last < SAME_SOUND_COOLDOWN_MS) return false;
    if (this.activeCount >= MAX_CONCURRENT) return false;
    this.lastPlayedAt[name] = now;
    this.lastGlobalPlayAt = now;
    return true;
  }

  play(name, opts = {}) {
    if (this.muted || !this.canPlay(name)) return null;
    const audio = this.sounds[name];
    if (!audio) return null;
    try {
      // Clone per playback so short stacked effects don't cut each other.
      const instance = audio.cloneNode();
      instance.volume = this.resolveVolume(opts.volume ?? SOUND_CONFIG[name]?.volume);
      this.activeCount += 1;
      const cleanup = () => {
        this.activeCount = Math.max(0, this.activeCount - 1);
        instance.removeEventListener("ended", cleanup);
        instance.removeEventListener("error", cleanup);
      };
      instance.addEventListener("ended", cleanup);
      instance.addEventListener("error", cleanup);
      const p = instance.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
      return instance;
    } catch {
      // Audio should never block UX.
      return null;
    }
  }

  playCombo(sequence = []) {
    if (!Array.isArray(sequence) || !sequence.length) return;
    sequence.forEach((item) => {
      const sound = item?.sound;
      const delay = Math.max(0, Number(item?.delay) || 0);
      window.setTimeout(() => this.play(sound), delay);
    });
  }

  playReward(level = "small") {
    if (level === "small") {
      this.play("xp");
      return;
    }
    if (level === "medium") {
      this.playCombo([
        { sound: "success", delay: 0 },
        { sound: "xp", delay: 100 },
      ]);
      return;
    }
    this.playCombo([
      { sound: "xp", delay: 0 },
      { sound: "badge", delay: 120 },
    ]);
  }
}

const soundManager = new SoundManager();
export default soundManager;
