import etro from 'etro';
 import { MediaElement } from '../../lib/types';

export class MediaStore {
 
    canvas: HTMLCanvasElement | null;
    movie: etro.Movie | null;
    videoElements: MediaElement[];
    audioElements: MediaElement[];
    imageElements: MediaElement[];
    framerate: number;
  
    constructor() {
        this.canvas = null;
        this.movie = null;
        this.videoElements = [];
        this.audioElements = [];
        this.imageElements = [];
        this.framerate = 60;
    }

    initCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    initVideos(videos: MediaElement[]) {
        this.videoElements = videos;
    }

    initAudios(audios: MediaElement[]) {
        this.audioElements = audios;
    }

    initImages(images: MediaElement[]) {
        this.imageElements = images;
    }

    addVideoElement(video: MediaElement) {
        this.videoElements = [...this.videoElements, video];
    }

    addAudioElement(audio: MediaElement) {
        this.audioElements = [...this.audioElements, audio];
    }

    addImageElement(image: MediaElement) {
        this.imageElements = [...this.imageElements, image];
    }

    // createMovie() {
    //     const movie = new etro.Movie({
    //         this.canvas,
    //         repeat: true,
    //         background: etro.parseColor("#ccc"),
    //     });
    //     this.imageElements.forEach(img => {
    //         const layer = new etro.layer.Image({startTime: img.timeFrame.start, duration: img.timeFrame.length, source: img.properties.src});
    //         movie.addLayer(layer);
    //     });
    //     this.videoElements.forEach(vid => {
    //         const layer = new etro.layer.Video({startTime: vid.timeFrame.start, duration: vid.timeFrame.length, source: vid.properties.src});
    //         movie.addLayer(layer);
    //     });
    //     this.audioElements.forEach(aud => {
    //         const layer = new etro.layer.Audio({startTime: aud.timeFrame.start, duration: aud.timeFrame.length, source: aud.properties.src});
    //         movie.addLayer(layer);
    //     });
    //     this.movie = movie;
    // }

    handlePlay() {
        if (this.movie) {
            this.movie.play();
            console.log('The movie is done playing');
        }
    }

    handlePause() {
        if (this.movie) {
            this.movie.pause();
        }
    }

    handleSeek(seek: number) {
        if (this.movie) {
            this.movie.seek(seek);
        }
    }
}
