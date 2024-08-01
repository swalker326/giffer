import { promisify } from "util";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

//function to make a random 6 character string
function makeId(length: number) {
	let result = "";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

//function to replace spaces in file names with underscores
function replaceSpaces(string: string) {
	return string.replace(/\s/g, "_");
}

function rm(filePath: string) {
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
}

const execAsync = promisify(exec);

export async function movToGif(file: File) {
	const imageBuffer = await file.arrayBuffer();
	const fileName = replaceSpaces(`${file.name.split(".")[0]}_${makeId(6)}`);
	const outputPath = "tmp/output/";
	const inputPath = "tmp/input/";
	const pathToFile = path.join(__dirname, inputPath, fileName);

	fs.createWriteStream(pathToFile).write(Buffer.from(imageBuffer));

	try {
		await execAsync("ffmpeg -version");
	} catch (err) {
		throw new Error(
			"ffmpeg not installed or missing from path, please download ffmpeg from https://ffmpeg.org",
		);
	}

	if (!file) {
		throw new Error("No file was provided");
	}

	const interval = setInterval(() => {
		process.stdout.write(".");
	}, 300);

	try {
		await execAsync(
			`ffmpeg -y -i ${path.join(
				__dirname,
				inputPath,
				fileName,
			)} -pix_fmt rgb8 -r 10 ${path.join(
				__dirname,
				outputPath,
				`${fileName}.gif`,
			)}`,
		);
		const gif = await fs.readFileSync(
			path.join(__dirname, outputPath, `${fileName}.gif`),
			{ encoding: "base64" },
		);
		rm(path.join(__dirname, inputPath, fileName));
		rm(path.join(__dirname, outputPath, `${fileName}.gif`));
		clearInterval(interval);
		return gif;
	} catch (error) {
		clearInterval(interval);
		if (error instanceof Error) {
			console.error(error);
			throw error;
		}
		throw new Error("An error occurred");
	}
}
