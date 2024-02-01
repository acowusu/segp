import etro from "etro";
import { TimelineEffect, TimelineRow } from "@xzdarcy/react-timeline-editor";

export class MediaStore {
  _movie: etro.Movie | null;
  framerate: number;
  data: TimelineRow[]; // timeline data
  effects: Record<string, TimelineEffect>; // video, audio, image controls.
  _actionLayerMap: Map<string, etro.layer.Base>;

  constructor() {
    this._movie = null;
    this.framerate = 30;

    this.data = [
      {
        id: "0",
        actions: [
          { id: "action0", start: 0, end: 2, effectId: "effect0" },
          { id: "action01", start: 4, end: 6, effectId: "effect01" },
        ],
      },
      {
        id: "1",
        actions: [{ id: "action2", start: 2, end: 4, effectId: "effect1" }],
      },
      {
        id: "2",
        actions: [{ id: "action3", start: 0, end: 2, effectId: "effect2" }],
      },
      {
        id: "3",
        actions: [{ id: "action4", start: 2, end: 4, effectId: "effect3" }],
      },
    ];

    this.effects = {
      effect0: {
        id: "effect0",
        name: "effect0",
      },
      effect1: {
        id: "effect1",
        name: "effect1",
      },
    };

    this._actionLayerMap = new Map<string, etro.layer.Base>();
  }

  setMovie(movie: etro.Movie) {
    this._movie = movie;
  }

  getMovie() {
    return this._movie;
  }

  hasMovieRef() {
    return this._movie;
  }

  addLayers(layers: etro.layer.Base[]) {
    layers.forEach((layer) => this._movie?.addLayer(layer));
  }

  addLayer(layer: etro.layer.Base) {
    this._movie?.addLayer(layer);
  }

  pause() {
    this._movie?.pause();
  }

  seek(seek: number) {
    this._movie?.seek(seek);
  }

  play() {
    this._movie?.play();
  }

  refresh() {
    this._movie?.refresh();
  }

  set(id: string, layer: etro.layer.Base) {
    this._actionLayerMap.set(id, layer);
  }

  get(id: string) {
    return this._actionLayerMap.get(id);
  }

  getActionMapValues() {
    return this._actionLayerMap.values();
  }
}
