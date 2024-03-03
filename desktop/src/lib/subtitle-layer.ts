import etro from 'etro'

enum TextStrokePosition {
    Inside,
    Center,
    Outside,
}




interface TextOptions extends etro.layer.VisualOptions {
    text: etro.Dynamic<string>
    font?: etro.Dynamic<string>
    color?: etro.Dynamic<etro.Color>
    /** The text's horizontal offset from the layer */
    textX?: etro.Dynamic<number>
    /** The text's vertical offset from the layer */
    textY?: etro.Dynamic<number>
    maxWidth?: etro.Dynamic<number>
    /**
     * @desc The horizontal alignment
     * @see [`CanvasRenderingContext2D#textAlign<`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign)
     */
    textAlign?: etro.Dynamic<string>
    /**
     * @desc The vertical alignment
     * @see [`CanvasRenderingContext2D#textBaseline`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline)
     */
    textBaseline?: etro.Dynamic<string>
    /**
     * @see [`CanvasRenderingContext2D#direction`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline)
     */
    textDirection?: etro.Dynamic<string>

    textStroke?: etro.Dynamic<{
        color: etro.Color,
        position?: TextStrokePosition
        thickness?: number
    }>
}

class SubtitleText extends etro.layer.Visual {
    text: etro.Dynamic<string>
    font: etro.Dynamic<string>
    color: etro.Dynamic<etro.Color>
    /** The text's horizontal offset from the layer */
    textX: etro.Dynamic<number>
    /** The text's vertical offset from the layer */
    textY: etro.Dynamic<number>
    maxWidth?: etro.Dynamic<number>
    /**
     * @desc The horizontal alignment
     * @see [`CanvasRenderingContext2D#textAlign<`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign)
     */
    textAlign: etro.Dynamic<string>
    /**
     * @desc The vertical alignment
     * @see [`CanvasRenderingContext2D#textBaseline`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline)
     */
    textBaseline: etro.Dynamic<string>
    /**
     * @see [`CanvasRenderingContext2D#direction`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline)
     */
    textDirection: etro.Dynamic<string>
    textStroke?: etro.Dynamic<{
        color: etro.Color,
        position?: TextStrokePosition
        thickness?: number
    }>


    /**
     * Creates a new text layer
     */
    // TODO: add padding options
    // TODO: is textX necessary? it seems inconsistent, because you can't define
    // width/height directly for a text layer
    constructor(options: TextOptions) {
        if (!options.text) {
            throw new Error('Property "text" is required in TextOptions')
        }

        // Default to no (transparent) background
        super({ background: undefined, ...options })
        // etro.applyOptions(options, this)
        this.text = options.text
        this.font = options.font ?? '10px sans-serif'
        this.color = options.color ?? etro.parseColor('#fff')
        this.textX = options.textX ?? 0
        this.textY = options.textY ?? 0
        this.maxWidth = options.maxWidth
        this.textAlign = options.textAlign ?? 'start'
        this.textBaseline = options.textBaseline ?? 'top'
        this.textDirection = options.textDirection ?? 'ltr'
        this.textStroke = options.textStroke


        // this._prevText = undefined;
        // // because the canvas context rounds font size, but we need to be more accurate
        // // rn, this doesn't make a difference, because we can only measure metrics by integer font sizes
        // this._lastFont = undefined;
        // this._prevMaxWidth = undefined;
    }

    doRender(): void {
        super.doRender()
        const text = etro.val(this, 'text', this.currentTime); const font = etro.val(this, 'font', this.currentTime)
        const maxWidth = this.maxWidth ? etro.val(this, 'maxWidth', this.currentTime) : undefined
        

        this.cctx.font = font
        this.cctx.textAlign = etro.val(this, 'textAlign', this.currentTime)
        this.cctx.textBaseline = etro.val(this, 'textBaseline', this.currentTime)
        this.cctx.direction = etro.val(this, 'textDirection', this.currentTime)
        const lines = getLines(this.cctx, text, maxWidth ?? 1900);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const { actualBoundingBoxLeft, fontBoundingBoxAscent, fontBoundingBoxDescent, width } = this.cctx.measureText(line);
            const heightOffset = i * (fontBoundingBoxAscent + fontBoundingBoxDescent);
            const totalHeight = lines.length * (fontBoundingBoxAscent + fontBoundingBoxDescent);
            this.cctx.fillStyle = "rgba(0,0,0,0.5)";
            this.cctx.fillRect(
                etro.val(this, 'textX', this.currentTime) - actualBoundingBoxLeft - 10,
                etro.val(this, 'textY', this.currentTime) - fontBoundingBoxAscent + heightOffset - totalHeight,
                width + 20,
                fontBoundingBoxAscent + fontBoundingBoxDescent
            )
            this.cctx.fillStyle = etro.val(this, 'color', this.currentTime)
            this.cctx.fillText(
                line, etro.val(this, 'textX', this.currentTime), etro.val(this, 'textY', this.currentTime) + heightOffset - totalHeight,
                maxWidth
            )

        }
        const textStroke = etro.val(this, 'textStroke', this.currentTime)
        if (textStroke) {
            this.cctx.strokeStyle = textStroke.color
            this.cctx.lineWidth = textStroke.thickness ?? 1
            const position = textStroke.position ?? 'outer'
            // Save the globalCompositeOperation, we have to revert it after stroking the text.
            const globalCompositionOperation = this.cctx.globalCompositeOperation
            switch (position) {
                case TextStrokePosition.Inside:
                    this.cctx.globalCompositeOperation = 'source-atop'
                    this.cctx.lineWidth *= 2
                    break
                case TextStrokePosition.Center:
                    break
                case TextStrokePosition.Outside:
                    this.cctx.globalCompositeOperation = 'destination-over'
                    this.cctx.lineWidth *= 2
                    break
            }

            this.cctx.strokeText(
                text,
                etro.val(this, 'textX', this.currentTime),
                etro.val(this, 'textY', this.currentTime),
                maxWidth
            )
            this.cctx.globalCompositeOperation = globalCompositionOperation
        }

      
    }

    // _updateMetrics(text, font, maxWidth) {
    //     // TODO calculate / measure for non-integer font.size etro.values
    //     let metrics = Text._measureText(text, font, maxWidth);
    //     // TODO: allow user-specified/overwritten width/height
    //     this.width = /*this.width || */metrics.width;
    //     this.height = /*this.height || */metrics.height;
    // }

    // TODO: implement setters and getters that update dimensions!

    /* static _measureText(text, font, maxWidth) {
          // TODO: fix too much bottom padding
          const s = document.createElement("span");
          s.textContent = text;
          s.style.font = font;
          s.style.padding = "0";
          if (maxWidth) s.style.maxWidth = maxWidth;
          document.body.appendChild(s);
          const metrics = {width: s.offsetWidth, height: s.offsetHeight};
          document.body.removeChild(s);
          return metrics;
      } */

    /**
     * @deprecated See {@link https://github.com/etro-js/etro/issues/131}
     */
    getDefaultOptions(): TextOptions {
        return {
            ...etro.layer.Visual.prototype.getDefaultOptions(),
            background: undefined,
            text: "", // required
            font: '10px sans-serif',
            color: etro.parseColor('#fff'),
            textX: 0,
            textY: 0,
            maxWidth: undefined,
            textAlign: 'start',
            textBaseline: 'top',
            textDirection: 'ltr',
            textStroke: undefined
        }
    }
}

function getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
export { SubtitleText, TextStrokePosition }
export type { TextOptions }
