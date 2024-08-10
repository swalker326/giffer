import { db } from "@giffer/db";

export const getConversationsWithMessages = async (userId: string) => {
	const conversations = await db.query.conversation.findMany({
		where: (conversation, { eq }) => eq(conversation.userId, userId),
		with: {
			messages: true,
		},
	});
	return conversations;
};
