import { type ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { AIService } from "~/ai/AIService";
import { VertexAdapter } from "~/ai/VertexAdapter.server";
import { FFMPEGCommand } from "./components/FFMPEGCommand";
import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Forward as ForwardIcon, PaperclipIcon } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";

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
		<div className="flex flex-col h-full w-full container gap-2 py-3">
			<h1 className="text-3xl font-semibold">Optimize Media</h1>
			<div className="flex-1 w-full border rounded-md p-3">
				{payload && (
					<div>
						<div>
							<h3 className="text-xl font-semibold">Commands</h3>
							{payload.response.commands.map((command) => (
								<FFMPEGCommand key={command.length} command={command} />
							))}
						</div>
						<div>
							<h3 className="text-xl font-semibold">Explanation</h3>
							<div className="prose">
								<Markdown>{payload.response.explanation}</Markdown>
							</div>
						</div>
					</div>
				)}
			</div>
			<Form method="POST" className="w-full">
				<div className="flex gap-1 items-center">
					<Textarea
						className="w-full bg-gray-100 text-lg"
						name="prompt"
						placeholder="What do you want to do?"
						onKeyDown={(e) => {
							if (e.key === "Enter" && e.metaKey) {
								e.preventDefault();
								e.currentTarget.form?.dispatchEvent(
									new Event("submit", { bubbles: true, cancelable: true }),
								);
							}
						}}
					/>
					<div className="flex flex-col gap-1 justify-between">
						<Button variant="outline" type="button">
							<PaperclipIcon />
						</Button>
						<Button type="submit">
							<ForwardIcon />
						</Button>
					</div>
				</div>
			</Form>
		</div>
	);
}
