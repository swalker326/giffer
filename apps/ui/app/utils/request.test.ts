import { describe, it, expect, vi } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fsync from "node:fs";
import { writeStreamToFile } from "./request.server";

// Mocking os, path, and fsync
vi.mock("node:os");
vi.mock("node:path");
vi.mock("node:fs");

describe("writeStreamToFile", () => {
	it("should write a stream to a file and return size and path", async () => {
		// Arrange
		const mockStream = new ReadableStream({
			start(controller) {
				controller.enqueue(new Uint8Array([1, 2, 3]));
				controller.close();
			},
		});
		const mockFilename = "testfile.txt";
		const mockTmpDir = "/tmp";
		const mockTmpFilename = path.join(mockTmpDir, mockFilename);
		const mockWriteStream = {
			write: vi.fn(),
			end: vi.fn(),
		};

		vi.spyOn(os, "tmpdir").mockReturnValue(mockTmpDir);
		vi.spyOn(path, "join").mockReturnValue(mockTmpFilename);
		vi.spyOn(fsync, "createWriteStream").mockReturnValue(
			mockWriteStream as unknown as fsync.WriteStream,
		);

		// Act
		const result = await writeStreamToFile(
			mockFilename,
			mockStream as unknown as ReadableStream<Uint8Array>,
		);

		// Assert
		expect(result).toEqual({ size: 3, path: mockTmpFilename });
		expect(mockWriteStream.write).toHaveBeenCalledTimes(1);
		expect(mockWriteStream.write).toHaveBeenCalledWith(
			new Uint8Array([1, 2, 3]),
		);
		expect(mockWriteStream.end).toHaveBeenCalled();
	});
});
