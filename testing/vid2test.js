import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from "ffmpeg-static"
import ffprobeStatic from 'ffprobe-static';

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);



function createVideoFromImages(images) {
  return new Promise((resolve, reject) => {
    if (!images || images.length === 0) {
      return reject(new Error("No images provided"));
    }

    const videoFilename = 'output.mp4';
    let currentDuration = 0;

    const ffmpegInstance = ffmpeg();

    images.forEach((image, index) => {
      const duration = index + 1; // Duration as per the image's position in the list
      currentDuration += duration;
    });

    ffmpeg()
      .input('video.mp4')
      .input('output.mp4')
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        resolve(`Video created: ${videoFilename}`);
      })
      .mergeToFile(videoFilename, '/tmp/')

  });
}

// Example usage
const imageList = ['alloy.png', 'echo.png', 'fable.png']; // Replace with actual image paths
createVideoFromImages(imageList)
  .then(result => console.log(result))
  .catch(error => console.error(error));