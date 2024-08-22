import { db } from "@giffer/db";
import { conversation } from "@giffer/db/models/conversation";
import { message as messageTable } from "@giffer/db/models/message";
import {
	type ActionFunctionArgs,
	unstable_defineAction,
} from "@remix-run/node";
import { z } from "zod";
import { AIService } from "~/ai/AIService";
import { OpenAIAdapter } from "~/ai/OpenAIAdapter";
import { runFFmpegCommand } from "~/ffmpeg/ffmpeg.server";
import { requireUserId } from "~/services/auth.server";
import { parseRequest } from "~/utils/request.server";

const isPremiumUser = (userId: string) => {
	return true;
};

const ParsedFileJsonSchema = z.object({
	name: z.string(),
	filename: z.string(),
	size: z.number(),
	path: z.string(),
});
export const FileSchema = z
	.string()
	.transform((str, ctx): z.infer<typeof ParsedFileJsonSchema> => {
		try {
			return JSON.parse(str);
		} catch (e) {
			ctx.addIssue({ code: "custom", message: "Invalid uploaded file JSON" });
			return z.NEVER;
		}
	});
const MessageSendRequestPayloadSchema = z.object({
	conversationId: z.string().nullable(),
	prompt: z.string(),
	uploadedFile: FileSchema.optional(),
});

export type MessageSendRequestPayload = z.infer<
	typeof MessageSendRequestPayloadSchema
>;

export const action = unstable_defineAction(
	async ({ request }: ActionFunctionArgs) => {
		const userId = await requireUserId(request, { redirectTo: "/login" });

		const submission = await parseRequest(request, {
			schema: MessageSendRequestPayloadSchema,
		});
		if (submission.status !== "success") {
			return { formErrors: ["Unable to parse response from submission"] };
		}

		const {
			prompt,
			uploadedFile,
			conversationId: initialConversationId,
		} = submission.value;

		let conversationId = initialConversationId || null;
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
		// const aiService = new AIService(new VertexAdapter());
		const aiService = new AIService(new OpenAIAdapter());
		const response = await aiService.submitPrompt({ prompt });
		const command = response.response.commands[0];
		let result: { fileName: string } = { fileName: "" };
		if (uploadedFile) {
			result = await runFFmpegCommand(command, uploadedFile.path);
		}

		await db.insert(messageTable).values({
			conversationId,
			content: response.response.explanation,
			commands: response.response.commands,
			...(result.fileName ? { uploadedFile: result.fileName } : {}),
			createdBy: "ai",
		});

		return {
			formErrors: [],
			status: "success",
			conversationId,
			didCreateConversation: !initialConversationId,
		};
	},
);
