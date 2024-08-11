import { parseWithZod } from "@conform-to/zod";
import { db } from "@giffer/db";
import { conversation } from "@giffer/db/models/conversation";
import { message as messageTable } from "@giffer/db/models/message";

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import type { AIAdapterPayload } from "~/ai/AIAdapter";
import { AIService } from "~/ai/AIService";
import { VertexAdapter } from "~/ai/VertexAdapter.server";
import { MessageSchema } from "~/routes/optimize/components/ConversationInput";
import { requireUserId } from "~/services/auth.server";

export async function action({ request }: LoaderFunctionArgs) {
	const formData = await request.formData();
	const userId = await requireUserId(request, { redirectTo: "/login" });
	const submission = parseWithZod(formData, { schema: MessageSchema });
	if (submission.status !== "success") {
		return submission.reply();
	}
	let conversationId = submission.value.conversationId;
	if (!submission.value.conversationId) {
		const [{ id }] = await db
			.insert(conversation)
			.values({
				label: "New Conversation",
				userId,
			})
			.returning({ id: conversation.id });
		conversationId = id;
	}
	const aiService = new AIService(new VertexAdapter());
	const aiRequest: AIAdapterPayload = {
		prompt: submission.value.prompt,
		...(submission.value.fileUrl ? { media: submission.value.fileUrl } : null),
	};
	await db.insert(messageTable).values({
		conversationId,
		content: submission.value.prompt,
		createdBy: userId,
	});
	const response = await aiService.submitPrompt(aiRequest);
	await db.insert(messageTable).values({
		conversationId,
		content: response.response.explanation,
		commands: JSON.stringify(response.response.commands),
		createdBy: "ai",
	});

	return json({
		...submission,
		conversationId,
		didCreateConversation: !submission.value.conversationId,
	});
}