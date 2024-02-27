import { Visual } from 'etro/src/layer/visual'
// import type { Visual } from 'etro/src/layer/visual'
import { VisualSourceOptions, VisualSourceMixin } from 'etro/src/layer/visual-source'
import { AudioSourceOptions, AudioSourceMixin } from 'etro/src/layer/audio-source'
type Constructor<T> = new (...args: unknown[]) => T

interface VideoOptions extends Omit<AudioSourceOptions & VisualSourceOptions, 'duration'|'source'> {
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
class CustomVideo extends AudioSourceMixin(VisualSourceMixin(Visual as Constructor<Visual>)) {
  /**
   * The raw html `<video>` element
   */
  source!: HTMLVideoElement

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
    } as (AudioSourceOptions & VisualSourceOptions))
  }
}

export { CustomVideo }
export type { VideoOptions }

