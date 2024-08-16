import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as fsSync from "node:fs";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { StorageFactory } from "~/storage/StorageFactory";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// 1. Function to write an AsyncIterable<Uint8Array> to a file
export async function writeAsyncIterableToFile(
	asyncIterable: AsyncIterable<Uint8Array>,
	filePath: string,
): Promise<void> {
	const writeStream = fsSync.createWriteStream(filePath);
	let hasData = false;

	for await (const chunk of asyncIterable) {
		hasData = true;
		if (!writeStream.write(chunk)) {
			await new Promise<void>((resolve) => writeStream.once("drain", resolve));
		}
	}

	await new Promise<void>((resolve, reject) => {
		writeStream.end((err: unknown) => {
			if (err) reject(err);
			else resolve();
		});
	});

	if (!hasData) {
		await fsSync.promises.unlink(filePath); // Ensure the empty file is removed
		throw new Error(
			"The provided AsyncIterable<Uint8Array> did not yield any data.",
		);
	}
}

// // 2. Function to generate the FFmpeg command
export function generateFFmpegCommand(
	origCommand: string,
	inputFile: string,
	outputFile: string,
): string {
	let command = origCommand;
	const inputRegex = /input\.[a-z0-9]+/i;
	const outputRegex = /output\.[a-z0-9]+/i;
	command = command.replace(inputRegex, (match) => {
		const extension = match.split(".").pop(); // Extract the extension
		return `${inputFile.replace(/\.[^/.]+$/, "")}.${extension}`;
	});
	command = command.replace(outputRegex, (match) => {
		const extension = match.split(".").pop(); // Extract the extension
		return `${outputFile.replace(/\.[^/.]+$/, "")}.${extension}`;
	});

	return command;
}

export async function executeFFmpegCommand(command: string): Promise<void> {
	try {
		await execAsync(command);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to execute FFmpeg command: ${error.message}`);
		}
		throw new Error("Failed to execute FFmpeg command");
	}
}

export async function* readFileAsAsyncIterable(
	filePath: string,
): AsyncIterable<Uint8Array> {
	const readStream = fsSync.createReadStream(filePath);
	for await (const chunk of readStream) {
		yield chunk;
	}
	await fs.unlink(filePath); // Clean up the file after reading
}

export async function runFFmpegCommand(
	command: string,
	inputData: AsyncIterable<Uint8Array>,
	fileName: string,
) {
	const extension = fileName.split(".").pop();
	if (!extension) {
		throw new Error("No extension found in the file name");
	}
	const tempDir = path.join(__dirname, "tmp");
	await fs.mkdir(tempDir, { recursive: true });

	const outputFilePathString = command.match(/output\.[a-z0-9]+/i);
	if (!outputFilePathString) {
		throw new Error("No output file path found in the command");
	}

	const inputFilePath = path.join(tempDir, `input.${extension}`);
	// TODO: Fix me file name
	const outputFilePath = path.join(tempDir, outputFilePathString[0]);

	await writeAsyncIterableToFile(inputData, inputFilePath);

	const ffmpegCommand = generateFFmpegCommand(
		command,
		inputFilePath,
		outputFilePath,
	);
	await executeFFmpegCommand(ffmpegCommand);

	const newFile = await readFileAsAsyncIterable(outputFilePath);
	const provider = process.env.STORAGE_PROVIDER;
	const bucketName = process.env.BUCKET_NAME;
	if (!provider) {
		throw new Error("No storage provider specified");
	}
	if (!bucketName) {
		throw new Error("No bucket name specified");
	}
	const signedUrl = await uploadFileToStorage(
		newFile,
		provider,
		bucketName,
		fileName,
	);
	return signedUrl;
}

// 6.upload file to storage
export async function uploadFileToStorage(
	data: AsyncIterable<Uint8Array>,
	provider: string,
	bucketName: string,
	fileName: string,
): Promise<{ url: string; id: string }> {
	const storageProvider = StorageFactory.createStorageProvider(
		provider,
		bucketName,
	);
	const id = nanoid();
	const uploadFileName = `${id}-${fileName}`;
	await storageProvider.uploadFile({
		data: data,
		destination: "uploads",
		name: uploadFileName,
	});
	return { url: await storageProvider.getSignedUrl(fileName), id };
}
