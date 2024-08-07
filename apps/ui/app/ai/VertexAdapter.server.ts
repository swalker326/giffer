import { VertexAI } from "@google-cloud/vertexai";
import {
	AIResponseSchema,
	type AIAdapter,
	type AIAdapterResponse,
} from "./AIAdapter";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
			systemInstruction:
				"you are an ffmpeg expert. You only answer questions that have something in the realm of ffmpeg. You only respond in json format with this structure {commands: [string], explanation: string} you explain the ffmpeg command(s) needed to achieve the desired output. The explanations should be markdown formatted.",
		});

		async submitPrompt(prompt: string): Promise<AIAdapterResponse> {
			const resp = await this.generativeModel.generateContent(prompt);
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
