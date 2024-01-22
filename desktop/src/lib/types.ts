export type MediaBaseElement<T extends string, P> = {
    readonly id: string;
    name: string;
    type: T;
    properties: P;
    timeFrame: TimeFrame;
};
 
export type VideoElement = MediaBaseElement<"video", {src: String}>;
export type ImageElement = MediaBaseElement<"image", {src: String}>;
export type AudioElement = MediaBaseElement<"audio", {src: String}>;

export type MediaElement = VideoElement | ImageElement | AudioElement;
 
export type TimeFrame = {
    start: number;
    length: number;
}
 