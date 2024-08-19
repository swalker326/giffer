import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as fsSync from "node:fs";
import * as os from "node:os";
import { promisify } from "node:util";
import { StorageFactory } from "~/storage/StorageFactory";
import { nanoid } from "nanoid";

const execAsync = promisify(exec);

// 1. Function to write an AsyncIterable<Uint8Array> to a file
export async function writeAsyncIterableToFile(
		filePath: string,
		asyncIterable: AsyncIterable<Uint8Array>,
	): Promise<void> {
		const writeStream = fsSync.createWriteStream(filePath);
		let hasData = false;

		for await (const chunk of asyncIterable) {
			hasData = true;
			if (!writeStream.write(chunk)) {
				await new Promise<void>((resolve) =>
					writeStream.once("drain", resolve),
				);
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
	const inputRegex = /input\.[a-z0-9]+/gi;
	const outputRegex = /output\.[a-z0-9]+/gi;
	command = command.replaceAll(inputRegex, (match) => {
		const extension = match.split(".").pop(); // Extract the extension
		return `${inputFile.replace(/\.[^/.]+$/, "")}.${extension}`;
	});
	command = command.replaceAll(outputRegex, (match) => {
		const extension = match.split(".").pop(); // Extract the extension
		return `${outputFile.replace(/\.[^/.]+$/, "")}.${extension}`;
	});
	console.log("::command", command);
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

export async function runFFmpegCommand(command: string, inputFilePath: string) {
	const extension = inputFilePath.split(".").pop();
	if (!extension) {
		throw new Error("No extension found in the file name");
	}

	const outputFilePathString = command.match(/output\.[a-z0-9]+/i);
	if (!outputFilePathString) {
		throw new Error("No output file path found in the command");
	}
	const tmpDir = os.tmpdir();
	console.log("::tmpDir", tmpDir);
	const outputFilePath = path.join(tmpDir, outputFilePathString[0]);
	const fileName = path.basename(outputFilePath);

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
	): Promise<{ fileName: string }> {
		const storageProvider = StorageFactory.createStorageProvider(
			provider,
			bucketName,
		);
		const id = nanoid();
		const uploadFileName = `${id}-${fileName}`;
		console.log("::uploadFileName", uploadFileName);
		await storageProvider.uploadFile({
			data: data,
			destination: "uploads",
			name: uploadFileName,
		});
		return { fileName: uploadFileName };
	}
