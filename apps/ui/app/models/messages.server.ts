import { db } from "@giffer/db";
import { StorageFactory } from "~/storage/StorageFactory";

export const fetchConversationMessages = async (conversationId: string) => {
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

	const messages = await db.query.message.findMany({
		where: (m, { eq }) => eq(m.conversationId, conversationId),
	});
	const messagesWithMedia = await Promise.all(
		messages.map(async (message) => {
			if (message.media) {
				const signedUrl = await storageProvider.getSignedUrl(message.media);
				return {
					...message,
					media: { fileName: message.media, url: signedUrl },
				};
			}
			return message;
		}),
	);
	return messagesWithMedia;
};
