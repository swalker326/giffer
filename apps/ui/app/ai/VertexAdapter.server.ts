import path from "node:path";
import { fileURLToPath } from "node:url";
import { VertexAI } from "@google-cloud/vertexai";
import {
	type AIAdapter,
	type AIAdapterPayload,
	type AIAdapterResponse,
	AIResponseSchema,
} from "./AIAdapter";
import { systemPrompt } from "./systemPrompt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VertexAdapter implements AIAdapter {
	projectId = "giffer-431700";
	vertexAI = new VertexAI({
		project: this.projectId,
		location: "us-central1",
		googleAuthOptions: {
			keyFilename: path.join(__dirname, "./giffer-431700-ee82365796e0.json"),
		},
	});
	generativeModel = this.vertexAI.getGenerativeModel({
		model: "gemini-1.5-flash-001",
		systemInstruction: systemPrompt,
	});

	async submitPrompt(payload: AIAdapterPayload): Promise<AIAdapterResponse> {
		const resp = await this.generativeModel.generateContent(payload.prompt);
		const vertexResponse = await resp.response;
		//TODO: better error handling
		if (
			!vertexResponse.candidates?.[0]?.content ||
			!vertexResponse.candidates?.[0]?.content.parts[0]?.text
		) {
			throw new Error("No content found");
		}
		const parsedResponse = AIResponseSchema.parse(
			vertexResponse.candidates[0].content.parts[0].text,
		);
		//TODO: actually safety check
		const contentResponse = {
			response: { ...parsedResponse },
			safetyCheckPassed: true,
		};
		return contentResponse;
	}
}
