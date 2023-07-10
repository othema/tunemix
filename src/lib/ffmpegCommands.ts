import { setGracefulCleanup, tmpNameSync } from "tmp-promise";

const ffmpeg = require("fluent-ffmpeg");
setGracefulCleanup()

export function combineAudios(audios: string[], onProgress?: (progress: any, func: string) => void) {
  return new Promise<string>((resolve, reject) => {
    const outPath = tmpNameSync({ postfix: ".mp3" });
    const command = ffmpeg();
    let filterText = "";
    for (let i = 0; i < audios.length; i++) {
      command.addInput(audios[i]);
      filterText += `[${i}:0]`;
    }
    
    command.complexFilter(`${filterText}concat=n=${audios.length}:v=0:a=1[out]`, `[out]`);
    command.output(outPath);
    command.on("end", () => resolve(outPath));
    command.on("error", (err: any) => reject(err));
    command.on("progress", (progress: any) => onProgress ? onProgress(progress, "combineAudios") : null)
    command.run();
  });
}

export function blankVideo(color: string, size: number[], duration: number, onProgress?: (progress: any, func: string) => void) {
  return new Promise<string>((resolve, reject) => {
    const outPath = tmpNameSync({ postfix: ".mp4" });
    ffmpeg()
      .addInput(`color=color=${color}:size=${size[0]}x${size[1]}:r=25`)
      .inputFormat("lavfi")
      .setDuration(duration)
      .output(outPath)
      .on("end", () => resolve(outPath))
      .on("error", (err: any) => reject(err))
      .on("progress", (progress: any) => onProgress ? onProgress(progress, "blankVideo") : null)
      .run();
  });
}

export async function resizeImage(path: string, size: number[], onProgress?: (progress: any, func: string) => void) {
  return new Promise<string>((resolve, reject) => {
    const outPath = tmpNameSync({ postfix: ".jpg" });
    ffmpeg()
      .addInput(path)
      .withSize(`${size[0]}x${size[1]}`)
      .output(outPath)
      .on("end", () => resolve(outPath))
      .on("error", (err: any) => reject(err))
      .on("progress", (progress: any) => onProgress ? onProgress(progress, "resizeImage") : null)
      .run();
  });
}

export async function overlayImage(videoPath: string, imagePath: string, onProgress?: (progress: any, func: string) => void) {
  return new Promise<string>((resolve, reject) => {
    const outPath = tmpNameSync({ postfix: ".mp4" });

    ffmpeg()
      .addInput(videoPath)
      .addInput(imagePath)
      // :enable='between(t,0,20)
      .complexFilter(`[0:v][1:v] overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'`)
      .outputOptions(["-pix_fmt yuv420p"])
      .audioCodec("copy")
      .output(outPath)
      .on("end", () => resolve(outPath))
      .on("error", (err: any) => reject(err))
      .on("progress", (progress: any) => onProgress ? onProgress(progress, "overlayImage") : null)
      .run();
  });
}

export async function addAudio(audioPath: string, videoPath: string, onProgress?: (progress: any, func: string) => void, path: string | null = null) {
  return new Promise<string>((resolve, reject) => {
    const outPath = path ? path : tmpNameSync({ postfix: ".mp4" });

    ffmpeg()
      .addInput(videoPath)
      .addInput(audioPath)
      .outputOptions(["-c copy"])
      .outputOptions(["-map 0:v:0"])
      .outputOptions(["-map 1:a:0"])
      .output(outPath)
      .on("end", () => resolve(outPath))
      .on("error", (err: any) => reject(err))
      .on("progress", (progress: any) => onProgress ? onProgress(progress, "addAudio") : null)
      .run();
  })
}
