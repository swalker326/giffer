import { promisify } from "util";
import { exec, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

export async function movToGif(file: Blob) {
  const imageBuffer = await file.arrayBuffer();
  const fileName = file.name.split(".")[0];
  const outputPath = "tmp/output/";
  const inputPath = "tmp/input/";
  const pathToFile = path.join(__dirname, inputPath, file.name);
  fs.createWriteStream(pathToFile).write(Buffer.from(imageBuffer));
  try {
    await execAsync("ffmpeg -version");
  } catch (err) {
    throw new Error(
      "ffmpeg not installed or missing from path, please download ffmpeg from https://ffmpeg.org"
    );
  }

  if (!file) {
    throw new Error("No file was provided");
  }

  // console.log(`Converting ${inputPath} to ${outputPath}`);
  const interval = setInterval(() => {
    process.stdout.write(".");
  }, 200);

  try {
    console.log("Building gif...");
    await execAsync(
      `ffmpeg -y -i ${path.join(
        __dirname,
        inputPath,
        file.name
      )} -pix_fmt rgb8 -r 10 ${path.join(
        __dirname,
        outputPath,
        `${fileName}.gif`
      )}`
    );
    clearInterval(interval);
    // const gifFile = await new File(
    //   [fs.readFileSync(path.join(__dirname, outputPath, `${fileName}.gif`))],
    //   `${fileName}.gif`,
    //   {
    //     type: "image/gif",
    //   }
    // );
    const gif = await fs.readFileSync(
      path.join(__dirname, outputPath, `${fileName}.gif`),
      { encoding: "base64" }
    );

    // // rm(file.name);
    // return blob;
    return gif;
  } catch (error) {
    clearInterval(interval);
    console.error(error);
    // throw new Error(error);
  }
}
