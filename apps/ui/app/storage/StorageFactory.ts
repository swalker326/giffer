import { GCPStorageProvider } from "./GCPStorageProvider";
import type { IStorageProvider } from "./IStorageProvider";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class StorageFactory {
	static createStorageProvider(
		provider: string,
		bucketName: string,
	): IStorageProvider {
		switch (provider) {
			case "gcp":
				return new GCPStorageProvider(bucketName);
			// case "aws":
			// 	return new S3StorageProvider(bucketName);
			// case "cloudflare":
			// 	return new CloudflareStorageProvider(bucketName);
			default:
				throw new Error("Unsupported storage provider");
		}
	}
}
