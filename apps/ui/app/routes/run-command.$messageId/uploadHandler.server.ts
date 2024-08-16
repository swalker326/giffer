import type { UploadHandler } from "@remix-run/node";
import { runFFmpegCommand } from "~/ffmpeg/ffmpeg.server";

async function createFileFromAsyncIterable(
	asyncIterable: AsyncIterable<Uint8Array>,
	fileName: string,
	mimeType: string,
): Promise<File> {
	const chunks: Uint8Array[] = [];

	for await (const chunk of asyncIterable) {
		chunks.push(chunk);
	}

	// Create a Blob from the chunks
	const blob = new Blob(chunks, { type: mimeType });

	// Create a File from the Blob
	const file = new File([blob], fileName, { type: mimeType });

	return file;
}

export const getUploadedFile: UploadHandler = async (parts) => {
	if (!parts.filename) {
		const chunks = [];
		// this handles none file parts
		for await (const chunk of parts.data) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);
		const textDecoder = new TextDecoder();
		return textDecoder.decode(buffer);
	}
	const extension = parts.filename.split(".").pop();
	if (!extension) {
		throw new Error("No extension found");
	}
	const results = await runFFmpegCommand(
		'ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4',
		parts.data,
		extension,
	);
	return results;
};
