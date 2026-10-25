import { asset } from "../asset.ts";
import { content } from "../content.ts";
import { pauseMusicForVideo } from "./music.ts";

export function initVideo(): void {
  const title = document.querySelector<HTMLElement>(".video__titulo");
  const video = document.querySelector<HTMLVideoElement>(".video__reproductor");

  if (!title || !video) return;

  title.textContent = content.textos.video.titulo;
  video.poster = asset(content.video.poster);
  video.src = asset(content.video.mp4);

  video.addEventListener("play", pauseMusicForVideo);
}
