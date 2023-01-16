import { movToGif } from "./movToGif";

export async function convertMovToGif(
  inputFile: Blob,
  outputFile = "output.gif"
) {
  try {
    console.log(`Converting ${inputFile.name} to ${outputFile}...`);
    const gif = await movToGif(inputFile);
    return gif;
  } catch (err) {
    console.error(`An error occurred: ${err}`);
  }
}