import { parseMultipartRequest } from "@mjackson/multipart-parser";
import { type SafeParseReturnType, z } from "zod";

export const parseRequest = async <T>(
	request: Request,
	{ schema }: { schema: Zod.Schema },
): Promise<SafeParseReturnType<T, T>> => {
	const responseObject = {} as Record<string, unknown>;
	for await (const part of parseMultipartRequest(request, {
		maxFileSize: 10000000,
	})) {
		if (!part.name) {
			continue;
		}

		if (part.isFile) {
			const { asyncIterable, size } = await readableStreamToAsyncIterable(
				await part.body,
			);
			responseObject[part.name] = {
				filename: part.filename,
				size: size,
				data: asyncIterable,
			};
		} else {
			responseObject[part.name] = await part.text();
		}
	}
	console.log("::RESPONSE OBJECT", responseObject);
	return schema.safeParse(responseObject);
};

export async function readableStreamToAsyncIterable(
	readableStream: ReadableStream<Uint8Array>,
): Promise<{ asyncIterable: AsyncIterable<Uint8Array>; size: number }> {
	let totalSize = 0;

	const asyncIterable = {
		async *[Symbol.asyncIterator]() {
			const reader = readableStream.getReader();
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					console.log("Stream reading done.");
					break;
				}
				if (value) {
					totalSize += value.length;
					console.log(`Chunk received: ${value.length} bytes`);
					yield value;
				}
			}
		},
	};

	// Create an array to store the chunks for later use
	const chunks: Uint8Array[] = [];

	// Iterate over the asyncIterable to calculate the size and collect chunks
	for await (const chunk of asyncIterable) {
		chunks.push(chunk);
	}

	// Create a new asyncIterable that will yield the collected chunks
	const finalIterable = {
		async *[Symbol.asyncIterator]() {
			for (const chunk of chunks) {
				yield chunk;
			}
		},
	};

	return { asyncIterable: finalIterable, size: totalSize };
}
