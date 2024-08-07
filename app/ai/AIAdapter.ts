import { z } from "zod";

const AIResponsePayloadSchema = z.object({
	commands: z.array(z.string()),
	explanation: z.string(),
});

export const AIResponseSchema = z
	.string()
	.transform((str, ctx): z.infer<typeof AIResponsePayloadSchema> => {
		//str will be a markdown codeblock
		//parse the codeblock
		const codeBlockRegex = /```json\n(?<json>.*)```/s;
		const matches = str.match(codeBlockRegex);
		if (!matches || !matches.groups) {
			ctx.addIssue({
				code: "custom",
				message: "Invalid JSON returned from AI response",
			});
			return z.NEVER;
		}
		try {
			const parsed = JSON.parse(matches.groups.json);
			return parsed;
		} catch (err) {
			ctx.addIssue({
				code: "custom",
				message: "Invalid JSON returned from AI response",
			});
			return z.NEVER;
		}
	});
const AIAdapterResponseSchema = z.object({
	response: AIResponseSchema,
	safetyCheckPassed: z.boolean(),
});
export type AIAdapterResponse = z.infer<typeof AIAdapterResponseSchema>;

export interface AIAdapter {
	submitPrompt(question: string): Promise<AIAdapterResponse>;
}
