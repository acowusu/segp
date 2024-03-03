import { useEffect, useRef } from "react";
import etro from "etro";
import { SubtitleText } from "../../lib/subtitle-layer";

const WIDTH = 1920; 
const HEIGHT = 1080;
interface MockVideoProps {
  backgroundUrl: string;
  avatarUrl: string;
  showAvatar?: boolean;
  showSubtitle?: boolean;
  subtitleStyle?: string;
}

export const MockVideo: React.FC<MockVideoProps> = ({
  backgroundUrl,
  avatarUrl,
  showAvatar = false,
  showSubtitle = false,
  subtitleStyle = "80px sans-serif",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movieRef = useRef<etro.Movie | null>();

  useEffect(() => {
    // Use the canvas ref to get the canvas element
    if (!canvasRef.current) return; // If the canvas ref is null,
    const canvas = canvasRef.current;

    // Create a new movie instance
    const movie = new etro.Movie({
      canvas,
      repeat: true,
      background: etro.parseColor("#ccc"),
    });

    // Add a video layer to the movie and play it
    const backgroundImage = new Image(WIDTH, HEIGHT);
    backgroundImage.src = backgroundUrl;
    const avatarImage = new Image(WIDTH, HEIGHT);
    avatarImage.src = avatarUrl;

    const backgroundLayer = new etro.layer.Image({
      startTime: 0,
      duration: 3,
      source: backgroundImage,
      sourceX: 0, // default: 0
      sourceY: 0, // default: 0
      x: 0, // default: 0
      y: 0, // default: 0
      width: WIDTH, // default: null (full width)
      height: HEIGHT, // default: null (full height)
      opacity: 0.8, // default: 1
    });

    const avatarLayer = new etro.layer.Image({
      startTime: 0,
      duration: 9,
      source: avatarImage,
      sourceX: 0, // default: 0
      sourceY: 0, // default: 0
      x: 0, // default: 0
      y: 0, // default: 0
      width: WIDTH, // default: null (full width)
      height: HEIGHT, // default: null (full height)
      opacity: 0.8, // default: 1
    });
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const layer1 = new etro.layer.Visual({
      startTime: 3,
      duration: 3,
      background: etro.parseColor("#f1f1f1"),
    });
    const layer2 = new etro.layer.Visual({
      startTime: 6,
      duration: 3,
      background: etro.parseColor("#010101"),
    });

    const subtitleLayer = new SubtitleText({
      startTime: 0,
      duration: 9,
      text:  (_element: etro.EtroObject, time: number) => {
        return Math.round(time) % 2 ==0 ? "Hello" : "World";
      },
      x: WIDTH/2-WIDTH/4, // default: 0
      y: HEIGHT-200, // default: 0
      width: WIDTH/2, // default: null (full width)
      height: parseInt(subtitleStyle) + 20, // default: null (full height)
      opacity: 1, // default: 1
      color: etro.parseColor('white'), // default: new etro.Color(0, 0, 0, 1)
      font: subtitleStyle, // default: '10px sans-serif'
      textX: WIDTH/4, // default: 0
      textY: parseInt(subtitleStyle), // default: 0
      textAlign: 'center', // default: 'left'
      textBaseline: 'alphabetic', // default: 'alphabetic'
      textDirection: 'ltr', // default: 'ltr'
      background: new etro.Color(0, 0, 0, 0.51), // default: null (transparent)

      // textStroke: { // default: null (no stroke)
      //   color: etro.parseColor('black'),
      //   thickness: 5, // default: 1
      // },
    });

    movie.addLayer(layer1);
    movie.addLayer(layer2);
    movie.addLayer(backgroundLayer);
    showSubtitle && movie.addLayer(subtitleLayer);
    showAvatar && movie.addLayer(avatarLayer);

    movie.play();
    movieRef.current = movie;
  }, [avatarUrl, backgroundUrl, showAvatar, showSubtitle, subtitleStyle]);
  return (
    <>
      <canvas className="w-full" ref={canvasRef} />
    </>
  );
};
