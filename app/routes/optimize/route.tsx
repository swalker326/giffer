import { type ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import React from "react";
import { AIService } from "~/ai/AIService";
import { VertexAdapter } from "~/ai/VertexAdapter.server";
import { FFMPEGCommand } from "./components/FFMPEGCommand";

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const prompt = formData.get("prompt");
	if (!prompt || typeof prompt !== "string") {
		throw new Error("An invalid prompt was provided");
	}
	const aiService = new AIService(new VertexAdapter());
	const response = await aiService.submitPrompt(prompt);
	return json({
		status: 200,
		response,
	});
};

export default function OptimizeRoute() {
	const actionResponse = useActionData<typeof action>();
	const payload = actionResponse?.response;
	return (
		<section>
			<Form method="POST">
				<textarea
					className="w-full border"
					name="prompt"
					placeholder="Enter a question"
				/>
				<button
					type="submit"
					className="border bg-purple-500 p-2 py-3 text-white rounded-md"
				>
					{" "}
					Ask{" "}
				</button>
			</Form>
			{payload && (
				<div>
					<h2>Response</h2>
					<div>
						<h3>Commands</h3>
						{payload.response.commands.map((command) => (
							<FFMPEGCommand command={command} />
						))}
					</div>
					<div>
						<h3>Explanation</h3>
						<pre>{payload.response.explanation}</pre>
					</div>
				</div>
			)}
		</section>
	);
}
