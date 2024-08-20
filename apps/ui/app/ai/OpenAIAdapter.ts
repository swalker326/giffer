import OpenAI from "openai";
import {
	type AIAdapter,
	type AIAdapterPayload,
	type AIAdapterResponse,
	AIResponseSchema,
} from "./AIAdapter";
import { systemPrompt } from "./systemPrompt";

export class OpenAIAdapter implements AIAdapter {
	client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	async submitPrompt(payload: AIAdapterPayload): Promise<AIAdapterResponse> {
		const msg = await this.client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{ role: "system", content: [{ type: "text", text: systemPrompt }] },
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

		const parsedResponse = AIResponseSchema.parse(
			msg.choices[0].message.content,
		);
		const contentResponse = {
			response: { ...parsedResponse },
			safetyCheckPassed: true,
		};
		return contentResponse;
	}
}
