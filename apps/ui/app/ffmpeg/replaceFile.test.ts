import { describe, it, expect } from "vitest";
import { generateFFmpegCommand } from "./ffmpeg.server";

describe("generateFFmpegCommand", () => {
	it("should replace input and output references with actual file paths while preserving extensions", () => {
		const ffmpegCommand =
			'ffmpeg -i input.mp4 -filter_complex "[0:v] scale=1280:720" output.mov';
		const actualInputFile = "/path/to/actualInput.avi";
		const actualOutputFile = "/path/to/actualOutput.mkv";

		const result = generateFFmpegCommand(
			ffmpegCommand,
			actualInputFile,
			actualOutputFile,
		);

		expect(result).toBe(
			'ffmpeg -i /path/to/actualInput.mp4 -filter_complex "[0:v] scale=1280:720" /path/to/actualOutput.mov',
		);
	});

	it('should work when input reference is not prefixed by "-i"', () => {
		const ffmpegCommand =
			'ffmpeg input.mp4 -filter_complex "[0:v] scale=1280:720" output.mov';
		const actualInputFile = "/path/to/actualInput.avi";
		const actualOutputFile = "/path/to/actualOutput.mkv";

		const result = generateFFmpegCommand(
			ffmpegCommand,
			actualInputFile,
			actualOutputFile,
		);

		expect(result).toBe(
			'ffmpeg /path/to/actualInput.mp4 -filter_complex "[0:v] scale=1280:720" /path/to/actualOutput.mov',
		);
	});

	it("should preserve file extensions of input and output when they are different", () => {
		const ffmpegCommand =
			'ffmpeg -i input.mov -filter_complex "[0:v] scale=1280:720" output.avi';
		const actualInputFile = "/path/to/actualInput.mp4";
		const actualOutputFile = "/path/to/actualOutput.mkv";

		const result = generateFFmpegCommand(
			ffmpegCommand,
			actualInputFile,
			actualOutputFile,
		);

		expect(result).toBe(
			'ffmpeg -i /path/to/actualInput.mov -filter_complex "[0:v] scale=1280:720" /path/to/actualOutput.avi',
		);
	});

	it("should throw an error if the input does not match the expected pattern", () => {
		const ffmpegCommand =
			'ffmpeg -i someOtherFile.mp4 -filter_complex "[0:v] scale=1280:720" anotherFile.mov';
		const actualInputFile = "/path/to/actualInput.avi";
		const actualOutputFile = "/path/to/actualOutput.mkv";

		// In this case, the function should not replace anything since the expected 'input.ext' and 'output.ext' are not found
		const result = generateFFmpegCommand(
			ffmpegCommand,
			actualInputFile,
			actualOutputFile,
		);

		// The original command should be returned unchanged
		expect(result).toBe(ffmpegCommand);
	});
});
