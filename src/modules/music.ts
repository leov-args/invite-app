import { content } from "../content.ts";
import { asset } from "../asset.ts";

const FADE_IN_OPEN = 1.5;
const FADE_TOGGLE = 0.8;
const FADE_VIDEO = 0.6;
const LOOP_FADE_OUT_THRESHOLD = 1.5;

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let button: HTMLButtonElement | null = null;

let isPlaying = false;
let pausedByVisibility = false;
let pauseTimeout: number | null = null;
let loopFadeStarted = false;

function createAudio(): void {
  if (audio) return;

  const el = document.createElement("audio");
  el.loop = false;
  el.preload = "auto";

  const srcOgg = document.createElement("source");
  srcOgg.src = asset(content.musica.ogg);
  srcOgg.type = "audio/ogg";

  const srcMp3 = document.createElement("source");
  srcMp3.src = asset(content.musica.mp3);
  srcMp3.type = "audio/mpeg";

  el.append(srcOgg, srcMp3);

  const context = new AudioContext();
  const source = context.createMediaElementSource(el);
  const gainNode = context.createGain();
  gainNode.gain.value = 0;
  source.connect(gainNode);
  gainNode.connect(context.destination);

  el.addEventListener("timeupdate", handleTimeUpdate);
  el.addEventListener("ended", handleEnded);

  audio = el;
  ctx = context;
  gain = gainNode;
}

function rampTo(target: number, duration: number): void {
  if (!ctx || !gain) return;
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(target, now + Math.max(0, duration));
}

function updateButton(): void {
  if (!button) return;
  const label = isPlaying ? content.textos.musica.pausar : content.textos.musica.reproducir;
  button.setAttribute("aria-label", label);
  button.classList.toggle("musica--sonando", isPlaying);
}

function clearPauseTimeout(): void {
  if (pauseTimeout !== null) {
    window.clearTimeout(pauseTimeout);
    pauseTimeout = null;
  }
}

function onPlayRejected(): void {
  if (audio && audio.paused) {
    isPlaying = false;
    updateButton();
  }
}

function play(fadeDuration: number): void {
  try {
    createAudio();
  } catch {
    return;
  }
  if (!audio || !ctx || !gain) return;

  clearPauseTimeout();
  void ctx.resume().catch(() => undefined);
  loopFadeStarted = false;
  isPlaying = true;
  pausedByVisibility = false;
  updateButton();

  audio.play().then(
    () => {
      if (isPlaying) rampTo(content.musica.volumen, fadeDuration);
    },
    onPlayRejected
  );
}

function pause(fadeDuration: number): void {
  if (!audio || !ctx || !gain) return;

  clearPauseTimeout();
  rampTo(0, fadeDuration);

  isPlaying = false;
  updateButton();

  pauseTimeout = window.setTimeout(() => {
    pauseTimeout = null;
    audio!.pause();
  }, fadeDuration * 1000);
}

function toggle(): void {
  pausedByVisibility = false;
  if (isPlaying) {
    pause(FADE_TOGGLE);
  } else {
    play(FADE_TOGGLE);
  }
}

function handleVisibilityChange(): void {
  if (document.hidden) {
    if (isPlaying) {
      pausedByVisibility = true;
      pause(FADE_TOGGLE);
    }
  } else if (pausedByVisibility) {
    play(FADE_TOGGLE);
  }
}

function handleTimeUpdate(): void {
  if (!audio || !isPlaying || loopFadeStarted || !audio.duration || !Number.isFinite(audio.duration)) {
    return;
  }
  const remaining = audio.duration - audio.currentTime;
  if (remaining <= LOOP_FADE_OUT_THRESHOLD) {
    loopFadeStarted = true;
    rampTo(0, Math.max(0, remaining));
  }
}

function handleEnded(): void {
  loopFadeStarted = false;
  if (!audio || !isPlaying) return;

  audio.currentTime = 0;
  audio.play().then(
    () => {
      if (isPlaying) rampTo(content.musica.volumen, FADE_IN_OPEN);
    },
    onPlayRejected
  );
}

export function playMusic(): void {
  play(FADE_IN_OPEN);
}

export function pauseMusicForVideo(): void {
  pausedByVisibility = false;
  if (!isPlaying) return;
  pause(FADE_VIDEO);
}

export function initMusic(): void {
  button = document.querySelector<HTMLButtonElement>("button.musica");
  if (!button) return;

  updateButton();
  button.addEventListener("click", toggle);
  document.addEventListener("visibilitychange", handleVisibilityChange);
}
