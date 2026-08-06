import fs from "fs";
import path from "path";

/** Server-only helper: check whether an asset exists in /public/media. */
export function mediaFileExists(...segments: string[]) {
  const full = path.join(process.cwd(), "public", "media", ...segments);
  return fs.existsSync(full);
}

export const HERO_POSTER = "/media/hero-poster.jpg";

export const HERO_VIDEO_SOURCES = [
  { src: "/media/hero-film.webm", type: "video/webm" },
  { src: "/media/hero-film.mp4", type: "video/mp4" },
];
