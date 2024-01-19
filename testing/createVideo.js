import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

export async function createVideo() {
  const inputImages = ['alloy.png', 'echo.png', 'alloy.png', 'echo.png', 'alloy.png'];
  const outputVideo = 'output.mp4';
  ffmpeg.setFfmpegPath(ffmpegStatic);

  const ffmpegInstance = ffmpeg();

  // Create a temporary folder to store image files
  const tempFolder = 'temp';
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }

  for (let i = 0; i < inputImages.length; i++) {
    const inputImage = inputImages[i];
    const tempImagePath = path.join(tempFolder, `frame${i + 1}.jpg`);

    // Copy input image to temporary folder
    fs.copyFileSync(inputImage, tempImagePath);

    // Add image as a video frame with a duration that increases with each frame
    ffmpegInstance.input(tempImagePath).inputFPS(1).duration(i + 1);
  }

  // Configure output video settings
  ffmpegInstance.output(outputVideo).videoCodec('libx264').size('640x480').duration(10);

  // Run FFmpeg to create the video
  await new Promise((resolve, reject) => {
    ffmpegInstance.on('end', () => {
      console.log('Video creation finished.');
      resolve();
    })
    .on('error', (err) => {
      console.error('Error:', err);
      reject(err);
    })
    .run();
  });

  // Cleanup temporary files
  fs.rmdirSync(tempFolder, { recursive: true });

  console.log(`Video saved as ${outputVideo}`);
}

createVideo();
