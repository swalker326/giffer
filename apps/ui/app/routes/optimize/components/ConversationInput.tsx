import { getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import {
	ForwardIcon,
	LoaderCircleIcon,
	PaperclipIcon,
	XIcon,
} from "lucide-react";
import { z } from "zod";
import { FileUploadButton } from "~/components/FileUploadButton";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { action as uploadAction } from "~/routes/upload";
import type { action as sendMessageAction } from "~/routes/message.send";
import React from "react";
import { useFetcherWithReset } from "~/hooks/useFetcherWithReset";

export const MessageSchema = z.object({
	conversationId: z.string().optional(),
	prompt: z.string(),
	fileUrl: z.string().optional(),
});
type Message = z.infer<typeof MessageSchema>;

export function ConversationInput() {
	const fileUploadFetcher = useFetcherWithReset<typeof uploadAction>({
		key: "upload",
	});
	const aiFetcher = useFetcher<typeof sendMessageAction>({
		key: "message.send",
	});
	const formRef = React.useRef<HTMLFormElement>(null);
	const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
	const navigate = useNavigate();
	const params = useParams();
	const conversationId = params.conversationId;
	const [form, fields] = useForm<Message>({
		// This not only syncs the error from the server
		// But is also used as the default value of the form
		// in case the document is reloaded for progressive enhancement
		// lastResult,
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: MessageSchema });
		},
		constraint: getZodConstraint(MessageSchema),
	});
	React.useEffect(() => {
		if (aiFetcher.data?.status === "success") {
			if ("didCreateConversation" in aiFetcher.data) {
				navigate(`/optimize/c/${aiFetcher.data.conversationId}`);
			}
		}
	}, [aiFetcher.data, navigate]);
	return (
		<aiFetcher.Form
			ref={formRef}
			action="/message/send"
			method="POST"
			className="py-1 bg-white"
			onSubmit={() => {
				fields.prompt.value = "";
			}}
		>
			<input type="hidden" name="conversationId" value={conversationId} />
			<input
				type="hidden"
				name="fileUrl"
				value={fileUploadFetcher.data?.file}
			/>
			<div className="flex gap-3 items-center pb-3 bg-gray-200 text-lg rounded-md p-3">
				{fileUploadFetcher.data?.file && (
					<div className="relative">
						<Button
							size="icon"
							variant="outline"
							className="absolute -top-2 -right-2 rounded-full w-5 h-5"
						>
							<XIcon
								onClick={() => {
									fileUploadFetcher.reset();
								}}
							/>
						</Button>
						<img
							alt="uploaded file preview"
							src={fileUploadFetcher.data.file}
							className="w-12 h-12"
						/>
					</div>
				)}
				<Textarea
					ref={textAreaRef}
					// {...getTextareaProps(fields.prompt)}
					name="prompt"
					className="w-full border-none bg-transparent resize-none text-lg"
					placeholder="What do you want to do?"
				/>
				<div id={fields.prompt.errorId}>{fields.prompt.errors}</div>
				<div className="flex flex-col gap-1 justify-between">
					<FileUploadButton
						fetcher={fileUploadFetcher}
						action="/upload"
						icon={<PaperclipIcon />}
					/>
					<Button
						size="icon"
						disabled={aiFetcher.state !== "idle"}
						type="submit"
					>
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
