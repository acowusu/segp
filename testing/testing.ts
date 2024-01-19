import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from "ffmpeg-static"

export async function createVideo() {
  const inputImages = ["/alloy.png", "/echo.png", "/alloy.png", "/echo.png"];
  const outputVideo = 'output.mp4';
  ffmpeg.setFfmpegPath(ffmpegStatic);


  const ffmpegInstance = ffmpeg();

  // Create a temporary folder to store image files
  const tempFolder = 'temp';
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }

  // Convert images to video frames
  for (let i = 0; i < inputImages.length; i++) {
    const inputImage = inputImages[i];
    const tempImagePath = path.join(tempFolder, `frame${i + 1}.jpg`);
    
    // Copy input image to temporary folder
    fs.copyFileSync(inputImage, tempImagePath);

    // Add image as a video frame
    ffmpegInstance.input(tempImagePath).inputFPS(1 / 5);
  }

  // Configure output video settings
  ffmpegInstance.output(outputVideo).videoCodec('libx264').size('640x480').duration(5);

  // Run FFmpeg to create the video
  await new Promise<void>((resolve, reject) => {
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











// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegStatic from "ffmpeg-static"
// import ffprobeStatic from 'ffprobe-static';

// ffmpeg.setFfmpegPath(ffmpegStatic);
// ffmpeg.setFfprobePath(ffprobeStatic.path);



// function createVideoFromImages(images) {
//   return new Promise((resolve, reject) => {
//     if (!images || images.length === 0) {
//       return reject(new Error("No images provided"));
//     }

//     const videoFilename = 'output.mp4';
//     let currentDuration = 0;

//     const ffmpegInstance = ffmpeg();

//     images.forEach((image, index) => {
//       const duration = index + 1; // Duration as per the image's position in the list
//       ffmpegInstance.input(image).loop(duration).inputOptions([`-t ${duration}`]);
//       currentDuration += duration;
//     });

//     ffmpegInstance
//       .on('error', (err) => {
//         reject(err);
//       })
//       .on('end', () => {
//         resolve(`Video created: ${videoFilename}`);
//       })
//       .mergeToFile(videoFilename, '/tmp/')
//       .videoCodec('libx264')
//       .audioCodec('aac')
//       .format('mp4');
//   });
// }

// // Example usage
// const imageList = ['alloy.png', 'echo.png', 'fable.png']; // Replace with actual image paths
// createVideoFromImages(imageList)
//   .then(result => console.log(result))
//   .catch(error => console.error(error));