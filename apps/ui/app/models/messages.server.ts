import { db } from "@giffer/db";

export const fetchConversationMessages = async (conversationId: string) => {
	return db.query.message.findMany({
		where: (m, { eq }) => eq(m.conversationId, conversationId),
	});
};
