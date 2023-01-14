import { movToGif } from "./movToGif";

export async function convertMovToGif(
  inputFile: Blob,
  outputFile = "output.gif"
) {
  console.log("typeof inputFile", typeof inputFile);
  // const gifOptions = {
  //   fps: 30,
  //   scale: 0.5,
  //   duration: 10,
  // };
  try {
    console.log(`Converting ${inputFile.name} to ${outputFile}...`);
    const gif = await movToGif(inputFile);
    // console.log("Gif in file.server.ts: ", gif);
    return gif;
  } catch (err) {
    console.error(`An error occurred: ${err}`);
  }
}

// Usage example
// convertMovToGif("input.mov", "output.gif");

// import { writeFile } from "fs/promises";
// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

// const ffmpeg = createFFmpeg({ log: true });

// export const convertVideo = async (file: File) => {
//   await ffmpeg.load();
//   ffmpeg.FS("writeFile", "test.avi", await fetchFile(file));
//   await ffmpeg.run("-i", "test.avi", "test.mp4");
//   const data = ffmpeg.FS("readFile", "test.mp4");
//   const convertedFile = new File([data.buffer], "test.gif", {
//     type: "video/gif",
//   });
//   return convertedFile;
// };
