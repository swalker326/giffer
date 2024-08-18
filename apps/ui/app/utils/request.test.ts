// import { describe, expect, it } from "vitest";
// import { ReadableStream as PolyFillReadableStream } from "web-streams-polyfill";
// import { readableStreamToAsyncIterable } from "./request.server";

// describe("readableStreamToAsyncIterable", () => {
// 	it("should correctly calculate the size of the stream and yield chunks", async () => {
// 		// Prepare some test data
// 		const chunks = [
// 			new Uint8Array([1, 2, 3]),
// 			new Uint8Array([4, 5, 6, 7, 8]),
// 			new Uint8Array([9]),
// 		];

// 		// Create a mock ReadableStream from the chunks
// 		const readableStream = new PolyFillReadableStream<Uint8Array>({
// 			start(controller) {
// 				// biome-ignore lint/complexity/noForEach: <explanation>
// 				chunks.forEach((chunk) => controller.enqueue(chunk));
// 				controller.close();
// 			},
// 		}) as unknown as ReadableStream<Uint8Array>;

// 		// Call the function
// 		const { asyncIterable, size } =
// 			await readableStreamToAsyncIterable(readableStream);

// 		// Check the size
// 		expect(size).toBe(9);

// 		// Collect the chunks yielded by the async iterable
// 		const receivedChunks: Uint8Array[] = [];
// 		for await (const chunk of asyncIterable) {
// 			receivedChunks.push(chunk);
// 		}

// 		// Check that the received chunks match the input chunks
// 		expect(receivedChunks).toEqual(chunks);
// 	});

// 	it("should handle an empty stream correctly", async () => {
// 		// Create an empty ReadableStream
// 		const readableStream = new ReadableStream({
// 			start(controller) {
// 				controller.close();
// 			},
// 		});

// 		// Call the function
// 		const { asyncIterable, size } =
// 			await readableStreamToAsyncIterable(readableStream);

// 		// Check the size
// 		expect(size).toBe(0);

// 		// Collect the chunks yielded by the async iterable
// 		const receivedChunks: Uint8Array[] = [];
// 		for await (const chunk of asyncIterable) {
// 			receivedChunks.push(chunk);
// 		}

// 		// Check that no chunks were yielded
// 		expect(receivedChunks).toHaveLength(0);
// 	});
// });

import { ReadableStream as PolyFillReadableStream } from "web-streams-polyfill";
import { describe, it, expect } from "vitest";
import { readableStreamToAsyncIterable } from "./request.server";

describe("readableStreamToAsyncIterable", () => {
	it("should correctly calculate the size of the stream and yield chunks", async () => {
		const chunks = [
			new Uint8Array([1, 2, 3]),
			new Uint8Array([4, 5, 6, 7, 8]),
			new Uint8Array([9]),
		];

		const readableStream = new PolyFillReadableStream({
			start(controller) {
				// biome-ignore lint/complexity/noForEach: <explanation>
				chunks.forEach((chunk) => controller.enqueue(chunk));
				controller.close();
			},
		}) as unknown as ReadableStream<Uint8Array>;

		const { asyncIterable, size } =
			await readableStreamToAsyncIterable(readableStream);

		expect(size).toBe(9);

		const receivedChunks: Uint8Array[] = [];
		for await (const chunk of asyncIterable) {
			receivedChunks.push(chunk);
		}

		expect(receivedChunks).toEqual(chunks);
	});
});
