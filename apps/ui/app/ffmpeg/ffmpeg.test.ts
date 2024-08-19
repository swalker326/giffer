import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import path from "node:path";
import * as fsSync from "node:fs";
import {
	writeAsyncIterableToFile,
	generateFFmpegCommand,
	readFileAsAsyncIterable,
} from "./ffmpeg.server";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, "/tmp");

describe("FFmpeg Utility Functions", () => {
	beforeEach(() => {
		fsSync.mkdirSync(tmpDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up the temporary directory after each test
		await fs.rm(tmpDir, { recursive: true, force: true });
		vi.restoreAllMocks(); // Restore mocks after each test
	});

	async function* createTestFileAsyncIterable(): AsyncIterable<Uint8Array> {
		const text = "test file";
		const encoder = new TextEncoder();
		const uint8Array = encoder.encode(text);
		yield uint8Array;
	}

	describe("writeAsyncIterableToFile", () => {
		it("should write data from an AsyncIterable<Uint8Array> to a file", async () => {
			const data = createTestFileAsyncIterable;
			const filePath = path.join(tmpDir, "test-file.bin");

			await writeAsyncIterableToFile(filePath, data());

			const fileContents = await fs.readFile(filePath);
			expect(fileContents).toEqual(Buffer.from("test file"));
		});

		it("should throw an error if no data is received", async () => {
			const emptyData = async function* (): AsyncIterable<Uint8Array> {
				/* Empty */
			};
			const filePath = path.join(tmpDir, "test-empty-file.bin");

			await expect(writeAsyncIterableToFile(filePath, emptyData())).rejects.toThrow(
				"The provided AsyncIterable<Uint8Array> did not yield any data.",
			);

			// Ensure the file does not exist after the error
			await expect(fs.access(filePath)).rejects.toThrow();
		});
	});

	describe("generateFFmpegCommand", () => {
		it("should replace input and output placeholders with actual file paths", () => {
			const command = 'ffmpeg -i input.mp4 -vf "scale=320:240" output.mp4';
			const inputFilePath = path.join(tmpDir, "input.mp4");
			const outputFilePath = path.join(tmpDir, "output.mp4");

			const result = generateFFmpegCommand(
				command,
				inputFilePath,
				outputFilePath,
			);

			expect(result).toBe(
				`ffmpeg -i ${inputFilePath} -vf "scale=320:240" ${outputFilePath}`,
			);
		});
		it("should replace all input and output references", () => {
			const command =
				'ffmpeg -i input.mp4 -vf "scale=320:240" -i input.mp4 output.gif';
			const inputFilePath = path.join(tmpDir, "input.mp4");
			const outputFilePath = path.join(tmpDir, "output.gif");
			console.log("::outputFile", outputFilePath);
			const result = generateFFmpegCommand(
				command,
				inputFilePath,
				outputFilePath,
			);
			expect(result).toBe(
				`ffmpeg -i ${inputFilePath} -vf "scale=320:240" -i ${inputFilePath} ${outputFilePath}`,
			);
		});
		it("should replace input and output placeholders with the correct extensions", () => {
			const command = 'ffmpeg -i input.mp4 -vf "scale=320:240" output.gif';
			const inputFilePath = path.join(tmpDir, "input.mp4");
			const outputFilePath = path.join(tmpDir, "output.gif");

			const result = generateFFmpegCommand(
				command,
				inputFilePath,
				outputFilePath,
			);

			expect(result).toBe(
				`ffmpeg -i ${inputFilePath} -vf "scale=320:240" ${outputFilePath}`,
			);
		});
	});

	describe("readFileAsAsyncIterable", () => {
		it("should read a file and yield its contents as an AsyncIterable", async () => {
			const filePath = path.join(tmpDir, "test-read-file.bin");
			await fs.writeFile(filePath, Buffer.from([1, 2, 3, 4, 5]));

			const chunks: Uint8Array[] = [];
			for await (const chunk of readFileAsAsyncIterable(filePath)) {
				chunks.push(chunk);
			}

			expect(Buffer.concat(chunks)).toEqual(Buffer.from([1, 2, 3, 4, 5]));
		});
	});
});
