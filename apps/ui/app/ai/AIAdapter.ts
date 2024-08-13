import { z } from "zod";

const AIResponsePayloadSchema = z.object({
	commands: z.array(z.string()),
	explanation: z.string(),
});

export const AIResponseSchema = z
	.string()
	.transform((str, ctx): z.infer<typeof AIResponsePayloadSchema> => {
		const codeBlockRegex = /```json(?<json>.*)```/s;
		const matches = str.match(codeBlockRegex);
		if (!matches || !matches.groups) {
			ctx.addIssue({
				code: "custom",
				message: "Unable to find JSON code block in AI response",
			});
			return z.NEVER;
		}
		try {
			const json = matches.groups.json.trim();
			const jsonString = JSON.parse(json);
			return jsonString;
		} catch (err) {
			if (err instanceof SyntaxError) {
				const errorIndexRegex =
					/Bad control character in string literal in JSON at position (?<index>\d+)/s;
				const errorIndexMatches = err.message.match(errorIndexRegex);
				if (errorIndexMatches?.groups) {
					const errorIndex = Number.parseInt(
						errorIndexMatches.groups.index,
						10,
					);
					const errorLine = matches.groups.json.split("")[errorIndex];
					ctx.addIssue({
						code: "custom",
						message: "Unable to parse JSON from AI response",
					});
					return z.NEVER;
				}
			}
			ctx.addIssue({
				code: "custom",
				message: "Unable to parse JSON from AI response",
			});
			return z.NEVER;
		}
	});

const AIAdapterResponseSchema = z.object({
	response: AIResponseSchema,
	safetyCheckPassed: z.boolean(),
});
export type AIAdapterResponse = z.infer<typeof AIAdapterResponseSchema>;

type AIAdapterPromptPayload = {
	prompt: string;
};
type AIAdapterPromptWithMediaPayload = {
	prompt: string;
	media: File;
	mediaMimeType: string;
};
export type AIAdapterPayload =
	| AIAdapterPromptPayload
	| AIAdapterPromptWithMediaPayload;

export interface AIAdapter {
	submitPrompt(payload: AIAdapterPayload): Promise<AIAdapterResponse>;
}
