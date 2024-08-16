import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import path from "node:path";
import * as fsSync from "node:fs";
// import cp from "node:child_process";
// import { exec } from "node:child_process";
import {
	writeAsyncIterableToFile,
	generateFFmpegCommand,
	executeFFmpegCommand,
	readFileAsAsyncIterable,
} from "./ffmpeg.server";
import { fileURLToPath } from "node:url";

import { exec } from "node:child_process";

vi.mock("node:child_process", async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		exec: vi.fn((command, callback) => {
			process.nextTick(() => {
				callback(null, { stdout: "mocked stdout", stderr: "" });
			});
			return { pid: 12345 }; // Mock ChildProcess object
		}),
	};
});
// Mock setup at the top level
// vi.mock("node:child_process", (importOriginal) => {
// 	const actualChildProcess =
// 		importOriginal() as unknown as typeof import("node:child_process");
// 	return {
// 		...actualChildProcess,
// 		exec: vi.fn((cmd, callback) => {
// 			// Log the command to ensure it's correct
// 			console.log("Mocked exec command:", cmd);

// 			// Simulate successful execution
// 			callback(null, "FFmpeg command executed");
// 		}),
// 	};
// });
// vi.mock("node:child_process", async () => {
// 	return {
// 		exec: vi.fn((cmd, callback) => {
// 			// Log the command to ensure it's correct
// 			console.log("Mocked exec command:", cmd);

// 			// Simulate successful execution
// 			callback(null, "FFmpeg command executed");
// 		}),
// 	};
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, "/tmp");

describe("FFmpeg Utility Functions", () => {
	beforeEach(() => {
		fsSync.mkdirSync(tmpDir, { recursive: true });
	});

	// afterEach(async () => {
	// 	// Clean up the temporary directory after each test
	// 	await fs.rm(tmpDir, { recursive: true, force: true });
	// 	vi.restoreAllMocks(); // Restore mocks after each test
	// });

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

			await writeAsyncIterableToFile(data(), filePath);

			const fileContents = await fs.readFile(filePath);
			console.log("::FILE CONTENTS:", fileContents);
			console.log("::FILE CONTENTS AS STRING:", fileContents.toString());
			expect(fileContents).toEqual(Buffer.from("test file"));
		});

		it("should throw an error if no data is received", async () => {
			const emptyData = async function* (): AsyncIterable<Uint8Array> {
				/* Empty */
			};
			const filePath = path.join(tmpDir, "test-empty-file.bin");

			await expect(
				writeAsyncIterableToFile(emptyData(), filePath),
			).rejects.toThrow(
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
	});

	describe("executeFFmpegCommand", () => {
		it("should execute the FFmpeg command", async () => {
			// Create a mock .gif file
			const gifFilePath = path.join(tmpDir, "input.gif");
			await fs.writeFile(gifFilePath, "GIF89a"); // Minimal valid GIF header

			const outputFilePath = path.join(tmpDir, "output.mp4");
			const command = `ffmpeg -i ${gifFilePath} -vf "scale=320:240" ${outputFilePath}`;

			// Execute the command
			await executeFFmpegCommand(command);

			// Assert that exec was called with the correct command
			// const execMock = vi.mocked(require("node:child_process").exec);
			expect(mockExec).toHaveBeenCalledWith(command, expect.any(Function));
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
