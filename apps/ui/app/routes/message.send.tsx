import { db } from "@giffer/db";
import { conversation } from "@giffer/db/models/conversation";
import { message as messageTable } from "@giffer/db/models/message";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
	unstable_defineAction,
} from "@remix-run/node";
import { z } from "zod";
import { AIService } from "~/ai/AIService";
import { AnthropicAdapter } from "~/ai/ClaudeAdapter.server";
import { VertexAdapter } from "~/ai/VertexAdapter.server";
import { runFFmpegCommand } from "~/ffmpeg/ffmpeg.server";
import { requireUserId } from "~/services/auth.server";
import { asyncIterableUint8ArraySchema } from "~/utils/asyncIterableUInt8Array";
import { parseRequest } from "~/utils/request.server";

const isPremiumUser = (userId: string) => {
	return true;
};

const MessageSendRequestPayloadSchema = z.object({
	conversationId: z.string().optional(),
	prompt: z.string(),
	uploadedFile: z.object({
		filename: z.string(),
		size: z.number(),
		data: asyncIterableUint8ArraySchema,
	}),
});
type MessageSendRequestPayload = z.infer<
	typeof MessageSendRequestPayloadSchema
>;

export const action = async ({ request }: ActionFunctionArgs) => {
	// const formData = await request.formData();
	const userId = await requireUserId(request, { redirectTo: "/login" });
	const submission = await parseRequest<MessageSendRequestPayload>(request, {
		schema: MessageSendRequestPayloadSchema,
	});
	if (submission.success === false) {
		console.error(submission.error.errors);
		throw new Error("Invalid submission");
	}

	const {
		conversationId: initialConversationId,
		prompt,
		uploadedFile,
	} = submission.data;
	console.log("::SUBMission", submission.data);
	let conversationId = initialConversationId;
	if (!conversationId) {
		const [{ id }] = await db
			.insert(conversation)
			.values({
				label: "New Conversation",
				userId,
			})
			.returning({ id: conversation.id });
		conversationId = id;
	}
	await db.insert(messageTable).values({
		conversationId: conversationId,
		content: prompt,
		createdBy: userId,
	});
	const isPrem = isPremiumUser(userId);

	// const aiService = new AIService(new AnthropicAdapter());
	const aiService = new AIService(new VertexAdapter());
	const response = await aiService.submitPrompt({ prompt });
	await db.insert(messageTable).values({
		conversationId,
		content: response.response.explanation,
		commands: response.response.commands,
		createdBy: "ai",
	});
	const command = response.response.commands[0];
	const result = await runFFmpegCommand(
		command,
		uploadedFile.data,
		uploadedFile.filename,
	);

	return json({
		status: "success",
		conversationId,

		convertedFileUrl: result.url,
		didCreateConversation: !initialConversationId,
	});
};
