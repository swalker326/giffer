import { getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import { ForwardIcon, LoaderCircleIcon, PaperclipIcon } from "lucide-react";
import { z } from "zod";
import { FileUploadButton } from "~/components/FileUploadButton";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { action as uploadAction } from "~/routes/upload";
import type { action as sendMessageAction } from "~/routes/message.send";
import { useEffect } from "react";
import React from "react";
import { L } from "vitest/dist/chunks/reporters.C_zwCd4j.js";

export const MessageSchema = z.object({
	conversationId: z.string().optional(),
	prompt: z.string(),
	fileUrl: z.string().optional(),
});
type Message = z.infer<typeof MessageSchema>;

export function ConversationInput() {
	const fileUploadFetcher = useFetcher<typeof uploadAction>({ key: "upload" });
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const navigate = useNavigate();
	const [form, fields] = useForm<Message>({
		// This not only syncs the error from the server
		// But is also used as the default value of the form
		// in case the document is reloaded for progressive enhancement
		// lastResult,
		constraint: getZodConstraint(MessageSchema),
	});
	const aiFetcher = useFetcher<typeof sendMessageAction>();
	React.useEffect(() => {
		if (aiFetcher.data?.status === "success") {
			if ("didCreateConversation" in aiFetcher.data) {
				navigate(`/optimize/c/${aiFetcher.data.conversationId}`);
			}
		}
	}, [aiFetcher.data, navigate]);
	const params = useParams();
	const conversationId = params.conversationId;
	return (
		<aiFetcher.Form action="/message/send" method="POST">
			<input type="hidden" name="conversationId" value={conversationId} />
			<input
				type="hidden"
				name="fileUrl"
				value={fileUploadFetcher.data?.file}
			/>
			<div className="flex gap-3 items-center pb-3">
				<Textarea
					ref={textareaRef}
					name="prompt"
					className="w-full bg-gray-100 text-lg"
					placeholder="What do you want to do?"
				/>
				<div className="flex flex-col gap-1 justify-between">
					<FileUploadButton
						fetcher={fileUploadFetcher}
						action="/upload"
						icon={<PaperclipIcon />}
					/>
					<Button disabled={aiFetcher.state !== "idle"} type="submit">
						{aiFetcher.state === "idle" ? (
							<ForwardIcon />
						) : (
							<LoaderCircleIcon className="animate-spin" />
						)}
					</Button>
				</div>
			</div>
		</aiFetcher.Form>
	);
}
