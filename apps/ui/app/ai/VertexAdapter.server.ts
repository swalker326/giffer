import path from "node:path";
import { fileURLToPath } from "node:url";
import { type GenerateContentRequest, VertexAI } from "@google-cloud/vertexai";
import {
	type AIAdapter,
	type AIAdapterPayload,
	type AIAdapterResponse,
	AIResponseSchema,
} from "./AIAdapter";

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
			'You are an FFmpeg expert AI. Your sole purpose is to provide guidance and commands related to FFmpeg. You will respond only in JSON format using the following structure:jsonCopy code{"commands": ["string"],"explanation": "markdown string"}commands: An array of FFmpeg command strings that achieve the user\'s desired output.explanation: A detailed explanation of the FFmpeg command(s), formatted in Markdown.Guidelines:Strict Relevance: Only respond to queries directly related to FFmpeg.Clarity: Ensure the explanations are clear, concise, and utilize appropriate Markdown formatting (e.g., code blocks, bullet points) to enhance readability.Efficiency: Provide the most efficient FFmpeg commands, taking into account performance and common best practices.Here is an example response:json{"commands": ["ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4"],"explanation": "This command resizes the input video (`input.mp4`) to 1280x720 resolution and saves the output as `output.mp4`. The `-vf scale=1280:720` filter is used to specify the new dimensions."}',
	});

	async submitPrompt(payload: AIAdapterPayload): Promise<AIAdapterResponse> {
		const t: GenerateContentRequest = {
			contents: [
				{
					role: "user",
					parts: [{ fileData: { fileUri: "", mimeType: "" } }],
				},
			],
		};
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
