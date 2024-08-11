import type { ActionFunctionArgs, UploadHandlerPart } from "@remix-run/node";
import { json, unstable_parseMultipartFormData } from "@remix-run/node";
import type { IStorageProvider } from "~/storage/IStorageProvider";
import { StorageFactory } from "~/storage/StorageFactory";

const uploadHandler = async (
	payload: UploadHandlerPart,
	storageProvider: IStorageProvider,
) => {
	if (payload.filename === undefined) {
		throw new Error("No file uploaded");
	}
	return storageProvider.uploadFile({
		data: payload.data,
		destination: "uploads",
		name: payload.filename,
	});
};

export async function action({ request }: ActionFunctionArgs) {
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

	const formData = await unstable_parseMultipartFormData(request, (props) =>
		uploadHandler(props, storageProvider),
	);
	const signedUrl = formData.get("uploadedFileUrl");
	if (typeof signedUrl !== "string") {
		throw new Error("No signed URL returned");
	}
	return json({ file: signedUrl });
}
