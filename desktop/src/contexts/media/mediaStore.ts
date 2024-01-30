import etro from 'etro';
import { TimelineEffect, TimelineRow } from '@xzdarcy/react-timeline-editor';

export class MediaStore {
 
    movie: etro.Movie | null;        
    framerate: number;
    data: TimelineRow[];                     // timeline data
    effects: Record<string, TimelineEffect>; // video, audio, image controls.
  
    constructor() {
        this.movie = null;
        this.framerate = 60;
        
        this.data = [{
            id: '0',
            actions: [{id: 'action0', start: 0, end: 2, effectId: 'effect0'},
                {id: 'action01', start: 4, end: 6, effectId: 'effect01'}],
        }, {
            id: '1',
            actions: [{id: 'action2', start: 2, end: 4, effectId: 'effect1'}],
        }, {
            id: '2',
            actions: [{id: 'action3', start: 0, end: 2, effectId: 'effect2'}],
        }, {
            id: '3',
            actions: [{id: 'action4', start: 2, end: 4, effectId: 'effect3'}],
        }];

        this.effects = {
            effect0: {
                id: 'effect0',
                name: 'effect0',
            },
            effect1: {
                id: 'effect1',
                name: 'effect1',
            },
        }
    }

    setMovie(movie: etro.Movie) {
        this.movie = movie;
    }

    addLayers(layers: etro.layer.Base[]) {
        layers.forEach(layer => this.movie?.addLayer(layer));
    }

    addLayer(layer: etro.layer.Base) {
        this.movie?.addLayer(layer);
    }

    pause() {
        this.movie?.pause();
    }

    seek(seek: number) {
        this.movie?.seek(seek);
    }

    play() {
        this.movie?.play();
    }

    refresh() {
        this.movie?.refresh();
    }
}
