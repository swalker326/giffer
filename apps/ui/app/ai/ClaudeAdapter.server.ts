import Anthropic from "@anthropic-ai/sdk";
import {
	type AIAdapter,
	type AIAdapterPayload,
	type AIAdapterResponse,
	AIResponseSchema,
} from "./AIAdapter";
import { systemPrompt } from "./systemPrompt";

export class AnthropicAdapter implements AIAdapter {
	anthropic = new Anthropic();

	async submitPrompt(payload: AIAdapterPayload): Promise<AIAdapterResponse> {
		const msg = await this.anthropic.messages.create({
			model: "claude-3-opus-20240229",
			max_tokens: 4000,
			temperature: 0,
			system: systemPrompt,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: payload.prompt,
						},
					],
				},
			],
		});
		if (msg.content[0].type === "text") {
			const parsedResponse = AIResponseSchema.parse(msg.content[0].text);
			const contentResponse = {
				response: { ...parsedResponse },
				safetyCheckPassed: true,
			};
			return contentResponse;
		}
		throw new Error("No content found");
	}
}
