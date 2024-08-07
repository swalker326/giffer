import type { ActionFunctionArgs, UploadHandlerPart } from "@remix-run/node";
import { json, unstable_parseMultipartFormData } from "@remix-run/node";
import { StorageFactory } from "~/storage/StorageFactory";

export async function action({ request }: ActionFunctionArgs) {
	const provider = process.env.STORAGE_PROVIDER; // e.g., 'gcp', 'aws', 'cloudflare'
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

	const uploadHandler = async (payload: UploadHandlerPart) => {
		if (payload.filename === undefined) {
			throw new Error("No file uploaded");
		}
		return storageProvider.uploadFile(
			payload.data,
			"uploads",
			payload.filename,
		);
	};

	const formData = await unstable_parseMultipartFormData(
		request,
		uploadHandler,
	);
	const signedUrl = formData.get("uploadedFileUrl");
	if (typeof signedUrl !== "string") {
		throw new Error("No signed URL returned");
	}
	console.log("::FILE", signedUrl);
	return json({ file: signedUrl });
}
