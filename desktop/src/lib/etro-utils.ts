/**
 * @prettier
 */

import etro from "etro";
import { ScriptData } from "../../electron/mockData/data";
import { LayerOpts } from "../../electron/mockData/data";

const WIDTH = 1920;
const HEIGHT = 1080;

function lerp(a: number, b: number, t: number, p: number) {
  return a + (b - a) * (t / p);
}

export function addSingleImageLayer(
  section: ScriptData,
  movie: etro.Movie,
  start: number
): number {
  if (!section.scriptMedia) throw new Error("No media found");
  if (!section.scriptDuration) throw new Error("No duration found");
  const layer = new etro.layer.Image({
    startTime: start,
    duration: section.scriptDuration,
    source: "local:///" + section.scriptMedia,
    destX: (_element: etro.EtroObject, time: number) => {
      return lerp(0, -WIDTH / 10, time, section.scriptDuration!);
    }, // default: 0
    destY: (_element: etro.EtroObject, time: number) => {
      return lerp(0, -HEIGHT / 10, time, section.scriptDuration!);
    }, // default: 0
    destWidth: (_element: etro.EtroObject, time: number) => {
      return lerp(WIDTH, WIDTH * 1.2, time, section.scriptDuration!);
    }, // default: null (full width)
    destHeight: (_element: etro.EtroObject, time: number) => {
      return lerp(HEIGHT, HEIGHT * 1.2, time, section.scriptDuration!);
    },
    x: 0, // default: 0
    y: 0, // default: 0
    sourceWidth: WIDTH,
    sourceHeight: HEIGHT,
    opacity: 1, // default: 1
  });
  console.log("adding layer", layer);
  movie.layers.push(layer);
  return start + section.scriptDuration;
}
const defaultLayerOpts: LayerOpts = {
  x: 0,
  y: 0,
};
export async function addSectionAvatar(
  section: ScriptData,
  movie: etro.Movie,
  start: number,
  opts?: LayerOpts
): Promise<number> {
  const effectiveOpts = { ...defaultLayerOpts, ...opts };

  if (!section.avatarVideoUrl) throw new Error("No avatarURL found");
  if (!section.scriptDuration) throw new Error("No duration found");
  const avatar = await window.api.getProjectAvatar();
  const layer = new etro.layer.Video({
    startTime: start,
    duration: section.scriptDuration,
    source: await window.api.toDataURL(section.avatarVideoUrl, "video/mp4"),
    destX: 0, // default: 0
    destY: 0, // default: 0
    destWidth: avatar.width, // default: null (full width)
    destHeight: avatar.height, // default: null (full height)
    x: effectiveOpts.x, // default: 0
    y: effectiveOpts.y, // default: 0
    opacity: 1, // default: 1
  });
  movie.layers.push(layer);
  console.log("adding layer", layer);

  return start + section.scriptDuration;
}
