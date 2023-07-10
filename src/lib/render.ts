import { addAudio, blankVideo, combineAudios, overlayImage, resizeImage } from "../lib/ffmpegCommands";
import { getAudioStream } from "./youtube";
import { setGracefulCleanup } from "tmp-promise";
import { ipcRenderer } from "electron";
import { formatDuration } from "./format";
// @ts-ignore
const colorThief = require("colorthief");

setGracefulCleanup();

export async function render(image: string, videos: any[], name: string, onPercent: (p: number) => void, onFinish: (p: string) => void, onCancel: () => void) {
  if (name === "") {
    name = "out"
  }
  ipcRenderer.invoke("dialog", "showSaveDialog", { defaultPath: name + ".mp4", filters: [{name: "MP4 Videos", extensions: ["mp4"]}] });
  let finalPath: string | null = null;

  ipcRenderer.once("dialog-return", async (event, saveDialog) => {
    if (saveDialog.canceled || !saveDialog.filePath) {
      onCancel();
      return;
    }
    finalPath = saveDialog.filePath;
    if (!finalPath?.endsWith(".mp4")) {
      finalPath += ".mp4";
    }
    const steps = 6;  // How many operations are we performing? (For progress tracking)
    let progress = 0;
    console.log(progress);
    let progressFunctions: { [key: string]: number } = {};

    const convertPercent = (percent: number) => Math.max(percent / (steps * 100) * 100, 0);  // Sometimes it goes to a random number for some reason
    const sendPercent = () => onPercent(Math.round(progress));

    function onProgress(p: any, func: string) {
      if (!p.percent) return;
      const perc = Math.max(p.percent, 0);
      if (perc === 0 || perc > 100) return;
      if (progressFunctions.hasOwnProperty(func)) {
        const change = perc - progressFunctions[func];
        console.log("CHANGE: " + change)
        progress += convertPercent(change)
      } else {
        console.log("f: " + perc);
        progress += convertPercent(perc);
      }
      progressFunctions[func] = perc;
      sendPercent();
    }

    let audios: string[] = [];
    let duration = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const id = video.id;
      const stream = await getAudioStream(id);
      audios.push(stream);
      duration += formatDuration(video.duration);
      onProgress({ percent: (i / videos.length) * 100 }, "download");
    }
    const dominantColor = await colorThief.getColor(image);
    const dominantHex = await rgbToHex(dominantColor[0], dominantColor[1], dominantColor[1]);
    const [audioPath, colorVideoPath, resizedImage] = await Promise.all([
      combineAudios(audios, onProgress),
      blankVideo(dominantHex, [1920, 1080], duration, onProgress),
      resizeImage(image, [630, 630], onProgress)
    ]);

    progress = 60;
    sendPercent();
    
    const videoOverlayPath = await overlayImage(colorVideoPath, resizedImage, onProgress);
    progress = 80;
    sendPercent();

    const finalOutput = await addAudio(audioPath, videoOverlayPath, onProgress, finalPath);
    progress = 100;
    sendPercent();

    onFinish(finalOutput)
    console.log(finalOutput);
  });
}

// https://stackoverflow.com/a/5624139/14086291
function rgbToHex(r: number, g: number, b: number) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}
