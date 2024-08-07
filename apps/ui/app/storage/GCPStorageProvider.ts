import { Storage } from "@google-cloud/storage";
import type { IStorageProvider } from "./IStorageProvider";
import { PassThrough } from "node:stream";

export class GCPStorageProvider implements IStorageProvider {
	private storage = new Storage({
		projectId: "giffer-431700",
		keyFilename: "./giffer-431700-1e14fe34cfb4.json",
	});
	private bucketName: string;
	private gcs: ReturnType<typeof Storage.prototype.bucket>;

	constructor(bucketName: string) {
		this.bucketName = bucketName;
		this.gcs = this.storage.bucket("giffer_dev");
	}
	async getSignedUrl(name: string): Promise<string> {
		const file = this.gcs.file(name);
		const signedUrl = await file.getSignedUrl({
			action: "read",
			expires: Date.now() + 1000 * 60 * 60, //1 hour,
		});
		return signedUrl[0];
	}

	async uploadFile(
		data: AsyncIterable<Uint8Array>,
		// destination: string,
		name: string,
	): Promise<string> {
		const file = this.gcs.file(name);
		const writeStream = file.createWriteStream();
		const passThroughStream = new PassThrough();

		// Pipe the async iterable into the pass-through stream
		(async () => {
			for await (const chunk of data) {
				passThroughStream.write(chunk);
			}
			passThroughStream.end();
		})();

		passThroughStream.pipe(writeStream);

		await new Promise((resolve, reject) => {
			writeStream.on("finish", resolve);
			writeStream.on("error", reject);
		});
		const signedUrl = await this.getSignedUrl(name);
		return signedUrl;
	}
}
