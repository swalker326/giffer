import {
	type ActionFunctionArgs,
	json,
	LoaderFunctionArgs,
	redirect,
} from "@remix-run/node";
import {
	Form,
	useActionData,
	useFetcher,
	useLoaderData,
	useSubmit,
} from "@remix-run/react";
import { AIService } from "~/ai/AIService";
import { VertexAdapter } from "~/ai/VertexAdapter.server";
import { FFMPEGCommand } from "./components/FFMPEGCommand";
import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Forward as ForwardIcon, PaperclipIcon } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { FileUploadButton } from "~/components/FileUploadButton";
import { action as uploadAction } from "~/routes/upload";
import { requireUserId } from "~/services/auth.server";
import { ConversationList } from "./components/ConversationList";
import { getConversationsWithMessages } from "~/models/conversation.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request, { redirectTo: "/login" });
	const conversations = await getConversationsWithMessages(userId);
	return json({
		conversations,
	});
};

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
	const { conversations } = useLoaderData<typeof loader>();
	const actionResponse = useActionData<typeof action>();
	const fileUploadFetcher = useFetcher<typeof uploadAction>({ key: "upload" });
	const payload = actionResponse?.response;
	return (
		<div className="flex h-full w-full gap-2 ">
			{/* left */}
			<ConversationList conversations={conversations} />
			{/* right */}
			<div className="flex flex-col w-full space-y-3 pr-3 pt-3">
				{/* conversation */}
				<div className="flex-1 border rounded-md p-3">
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
				{/* input */}
				<div className="flex gap-3 items-center pb-3">
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
						<FileUploadButton
							fetcher={fileUploadFetcher}
							action="/upload"
							icon={<PaperclipIcon />}
						/>
						<Button type="submit">
							<ForwardIcon />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
