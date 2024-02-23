import { Visual, VisualOptions } from './visual'
import etro from 'etro'
type Constructor<T> = new (...args: unknown[]) => T

interface VisualSource extends Visual {
  readonly source: HTMLImageElement | HTMLVideoElement

  /** What part of {@link source} to render */
  sourceX: etro.Dynamic<number>
  /** What part of {@link source} to render */
  sourceY: etro.Dynamic<number>
  /** What part of {@link source} to render, or undefined for the entire width */
  sourceWidth: etro.Dynamic<number>
  /** What part of {@link source} to render, or undefined for the entire height */
  sourceHeight: etro.Dynamic<number>
  /** Where to render {@link source} onto the layer */
  destX: etro.Dynamic<number>
  /** Where to render {@link source} onto the layer */
  destY: etro.Dynamic<number>
  /** Where to render {@link source} onto the layer, or undefined to fill the layer's width */
  destWidth: etro.Dynamic<number>
  /** Where to render {@link source} onto the layer, or undefined to fill the layer's height */
  destHeight: etro.Dynamic<number>
}

interface VisualSourceOptions extends etro.layer.VisualOptions  {
  source: HTMLImageElement | HTMLVideoElement
  /** What part of {@link source} to render */
  sourceX?: etro.Dynamic<number>
  /** What part of {@link source} to render */
  sourceY?: etro.Dynamic<number>
  /** What part of {@link source} to render, or undefined for the entire width */
  sourceWidth?: etro.Dynamic<number>
  /** What part of {@link source} to render, or undefined for the entire height */
  sourceHeight?: etro.Dynamic<number>
  /** Where to render {@link source} onto the layer */
  destX?: etro.Dynamic<number>
  /** Where to render {@link source} onto the layer */
  destY?: etro.Dynamic<number>
  /** Where to render {@link source} onto the layer, or undefined to fill the layer's width */
  destWidth?: etro.Dynamic<number>
  /** Where to render {@link source} onto the layer, or undefined to fill the layer's height */
  destHeight?: etro.Dynamic<number>
}

/**
 * A layer that gets its image data from an HTML image or video element
 * @mixin VisualSourceMixin
 */
function VisualSourceMixin<OptionsSuperclass extends VisualOptions> (superclass: Constructor<Visual>): Constructor<VisualSource> {
  type MixedVisualSourceOptions = OptionsSuperclass & VisualSourceOptions

  class MixedVisualSource extends superclass {
    /**
     * The raw html media element
     */
    readonly source: HTMLImageElement | HTMLVideoElement | undefined

    /** What part of {@link source} to render */
    sourceX: etro.Dynamic<number>
    /** What part of {@link source} to render */
    sourceY: etro.Dynamic<number>
    /** What part of {@link source} to render, or undefined for the entire width */
    sourceWidth: etro.Dynamic<number>
    /** What part of {@link source} to render, or undefined for the entire height */
    sourceHeight: etro.Dynamic<number>
    /** Where to render {@link source} onto the layer */
    destX: etro.Dynamic<number>
    /** Where to render {@link source} onto the layer */
    destY: etro.Dynamic<number>
    /** Where to render {@link source} onto the layer, or undefined to fill the layer's width */
    destWidth: etro.Dynamic<number>
    /** Where to render {@link source} onto the layer, or undefined to fill the layer's height */
    destHeight: etro.Dynamic<number>

    constructor (options: MixedVisualSourceOptions) {
      if (!options.source) {
        throw new Error('Property "source" is required in options')
      }

      super(options)
      this.sourceX = options.sourceX ?? 0
      this.sourceY = options.sourceY ?? 0  
      this.destX = options.destX ?? 0
      this.destY = options.destY ?? 0
      this.sourceWidth = options.sourceWidth ?? 0
      this.sourceHeight = options.sourceHeight ?? 0
      this.destHeight = options.destHeight
      this.destWidth = options.destWidth 
      
    }

    async whenReady (): Promise<void> {
      await super.whenReady()

      await new Promise<void>(resolve => {
        if (this.source instanceof HTMLImageElement) {
          // The source is an image; wait for it to load
          if (this.source.complete) {
            resolve()
          } else {
            this.source.addEventListener('load', () => {
              resolve()
            })
          }
        } else {
          // The source is a video; wait for the first frame to load
          if (this.source.readyState === 4) {
            resolve()
          } else {
            this.source.addEventListener('canplaythrough', () => {
              resolve()
            })
          }
        }
      })
    }

    doRender () {
      // Clear/fill background
      super.doRender()

      /*
       * Source dimensions crop the image. Dest dimensions set the size that
       * the image will be rendered at *on the layer*. Note that this is
       * different from the layer dimensions (`this.width` and `this.height`).
       * The main reason this distinction exists is so that an image layer can
       * be rotated without being cropped (see iss #46).
       */
      this.cctx.drawImage(
        this.source,
         etro.val(this, 'sourceX', this.currentTime),  etro.val(this, 'sourceY', this.currentTime),
         etro.val(this, 'sourceWidth', this.currentTime),  etro.val(this, 'sourceHeight', this.currentTime),
        // `destX` and `destY` are relative to the layer
         etro.val(this, 'destX', this.currentTime),  etro.val(this, 'destY', this.currentTime),
         etro.val(this, 'destWidth', this.currentTime),  etro.val(this, 'destHeight', this.currentTime)
      )
    }

    get ready (): boolean {
      // Typescript doesn't support `super.ready` when targeting es5
      const superReady = Object.getOwnPropertyDescriptor(superclass.prototype, 'ready').get.call(this)
      const sourceReady = this.source instanceof HTMLImageElement
        ? this.source.complete
        : this.source.readyState === 4
      return superReady && sourceReady
    }

    /**
     * @deprecated See {@link https://github.com/etro-js/etro/issues/131}
     */
    getDefaultOptions (): MixedVisualSourceOptions {
      return {
        ...superclass.prototype.getDefaultOptions(),
        source: undefined, // required
        sourceX: 0,
        sourceY: 0,
        sourceWidth: undefined,
        sourceHeight: undefined,
        destX: 0,
        destY: 0,
        destWidth: undefined,
        destHeight: undefined
      }
    }
  }
  MixedVisualSource.prototype.propertyFilters = {
    ...Visual.prototype.propertyFilters,

    /*
     * If no layer width was provided, fall back to the dest width.
     * If no dest width was provided, fall back to the source width.
     * If no source width was provided, fall back to `source.width`.
     */
    sourceWidth: function (sourceWidth) {
      // != instead of !== to account for `null`
      const width = this.source instanceof HTMLImageElement
        ? this.source.width
        : this.source.videoWidth
      return sourceWidth != undefined ? sourceWidth : width // eslint-disable-line eqeqeq
    },
    sourceHeight: function (sourceHeight) {
      const height = this.source instanceof HTMLImageElement
        ? this.source.height
        : this.source.videoHeight
      return sourceHeight != undefined ? sourceHeight : height // eslint-disable-line eqeqeq
    },
    destWidth: function (destWidth) {
      // I believe reltime is redundant, as element#currentTime can be used
      // instead. (TODO: fact check)
      /* eslint-disable eqeqeq */
      return destWidth != undefined
        ? destWidth
        :  etro.val(this, 'sourceWidth', this.currentTime)
    },
    destHeight: function (destHeight) {
      /* eslint-disable eqeqeq */
      return destHeight != undefined
        ? destHeight
        :  etro.val(this, 'sourceHeight', this.currentTime)
    },
    width: function (width) {
      /* eslint-disable eqeqeq */
      return width != undefined
        ? width
        :  etro.val(this, 'destWidth', this.currentTime)
    },
    height: function (height) {
      /* eslint-disable eqeqeq */
      return height != undefined
        ? height
        :  etro.val(this, 'destHeight', this.currentTime)
    }
  }

  return MixedVisualSource
}

export { VisualSource, VisualSourceOptions, VisualSourceMixin }