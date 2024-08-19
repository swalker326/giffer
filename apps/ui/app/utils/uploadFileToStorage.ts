import { StorageFactory } from "~/storage/StorageFactory";

export default function uploadToStorage() {
	const provider = process.env.STORAGE_PROVIDER;
	const bucketName = process.env.BUCKET_NAME;
	if (!provider) {
		throw new Error("No storage provider specified");
	}
	if (!bucketName) {
		throw new Error("No bucket name specified");
	}
	const storageProvider = StorageFactory.createStorageProvider(
		provider,
		bucketName,
	);
}