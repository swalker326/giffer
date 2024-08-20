import * as os from "node:os";
import * as path from "node:path";
import * as fsync from "node:fs";
import { parseMultipartRequest } from "@mjackson/multipart-parser";
import type { ZodTypeAny } from "zod";
import { parseWithZod } from "@conform-to/zod";

export const parseRequest = async <Schema extends ZodTypeAny>(
	request: Request,
	{ schema }: { schema: Schema },
) => {
	const responseObject = new FormData();
	for await (const part of parseMultipartRequest(request, {
		maxFileSize: 55000000,
	})) {
		if (!part.name) {
			continue;
		}

		if (part.isFile) {
			if (!part.filename) {
				continue;
			}
			const { size, path } = await writeStreamToFile(
				part.filename,
				await part.body,
			);
			if (size !== 0) {
				const payload = {
					filename: part.filename,
					size: size,
					path: path,
				};
				responseObject.append(part.name, JSON.stringify(payload));
			}
		} else {
			responseObject.append(part.name, await part.text());
		}
	}
	return parseWithZod<Schema>(responseObject, { schema });
};

export async function writeStreamToFile(
	filename: string,
	stream: ReadableStream<Uint8Array>,
) {
	const tmpDir = os.tmpdir();
	const tmpFilename = path.join(tmpDir, filename);
	const file = fsync.createWriteStream(tmpFilename);
	let bytesWritten = 0;

	//@ts-expect-error - The stream is not a Node.js stream
	for await (const chunk of stream) {
		file.write(chunk);
		bytesWritten += chunk.byteLength;
	}

	file.end();

	return { size: bytesWritten, path: tmpFilename };
}

// use for debugging
// async function stringifyReadableStreamBody(request: Request): Promise<string> {
// 	const reader = request.body?.getReader();
// 	const decoder = new TextDecoder();
// 	let result = "";
// 	if (!reader) {
// 		return result;
// 	}

// 	while (true) {
// 		const { done, value } = await reader.read();
// 		if (done) break;
// 		result += decoder.decode(value, { stream: true });
// 	}

// 	// Final decode to ensure any remaining bits are flushed
// 	result += decoder.decode();

// 	return result;
// }

// async function logRequestBody(request: Request) {
// 	try {
// 		const bodyString = await stringifyReadableStreamBody(request);
// 		console.log("Request body:");
// 		console.log(bodyString);
// 	} catch (error) {
// 		console.error("Error reading request body:", error);
// 	}
// }
