import etro from 'etro'

class MyVisual extends etro.layer.Visual {
    constructor(...args: unknown[]) {
      super(args[0] as etro.layer.VisualOptions);
    }
  }
  
interface VideoOptions extends Omit<etro.layer.AudioSourceOptions & etro.layer.VisualSourceOptions, 'duration'|'source'> {
  duration?: number

  /**
   * The raw html `<video>` element
   */
  source: string | HTMLVideoElement
}

/**
 * Layer for an HTML video element
 * @extends AudioSource
 * @extends VisualSource
 */
class CustomVideo extends etro.layer.VisualSourceMixin(MyVisual) {
  /**
   * The raw html `<video>` element
   */
  source!: HTMLVideoElement;

  constructor (options: VideoOptions) {
    if (typeof (options.source) === 'string') {
      const video = document.createElement('video')
      video.src = options.source
      options.source = video
    }

    super({
      ...options,

      // Set a default duration so that the super constructor doesn't throw an
      // error
      duration: options.duration ?? 0
    } as (etro.layer.AudioSourceOptions & etro.layer.VisualSourceOptions))
  }
}

export { CustomVideo }
export type { VideoOptions };
