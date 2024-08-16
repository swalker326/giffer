import { getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import {
	ForwardIcon,
	LoaderCircleIcon,
	PaperclipIcon,
	XIcon,
} from "lucide-react";
import React from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import type { action as sendMessageAction } from "~/routes/message.send";
import type { action as uploadAction } from "~/routes/upload";
import { MediaPreview } from "./MediaPreview";

export const MessageSchema = z.object({
	conversationId: z.string().optional(),
	prompt: z.string(),
	fileUrl: z.string().optional(),
});
type Message = z.infer<typeof MessageSchema>;

export function ConversationInput() {
	const fileUploadButtonRef = React.useRef<FileUploadButtonRef | null>(null);
	const fileUploadFetcher = useFetcher<typeof uploadAction>();
	const aiFetcher = useFetcher<typeof sendMessageAction>();
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [files, setFiles] = React.useState<FileList | undefined>();
	const navigate = useNavigate();
	const params = useParams();
	const conversationId = params.conversationId;
	const [form, fields] = useForm<Message>({
		// This not only syncs the error from the server
		// But is also used as the default value of the form
		// in case the document is reloaded for progressive enhancement
		// lastResult,
		// shouldValidate: "onBlur",
		shouldRevalidate: "onBlur",
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
		<div className="sm:container sm:max-w-4xl sm:mx-auto py-4">
			<aiFetcher.Form
				action="/message/send"
				method="POST"
				// onSubmit={form.onSubmit}
				id={form.id}
				onSubmit={(e) => {
					form.onSubmit(e);
					inputRef.current?.focus();
					inputRef.current?.select();
				}}
			>
				<input type="hidden" name="conversationId" value={conversationId} />
				<input
					type="hidden"
					name="fileUrl"
					value={fileUploadFetcher.data?.file}
				/>
				<div className="flex gap-3 items-center md:text-lg rounded-md p-1 border">
					{files && (
						<div className="relative">
							<Button
								size="icon"
								variant="outline"
								className="absolute -top-2 -right-2 rounded-full w-5 h-5"
							>
								<XIcon
									onClick={() => {
										setFiles(undefined);
										fileUploadButtonRef.current?.clearInput();
									}}
								/>
							</Button>
							<MediaPreview fileList={files} />
						</div>
					)}
					<input
						ref={inputRef}
						{...getInputProps(fields.prompt, { type: "text" })}
						className="text-lg border-none flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-3 ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-none focus-visible:ring-transparent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="What do you want to do?"
					/>
					<div id={fields.prompt.errorId}>{fields.prompt.errors}</div>
					<div className="flex flex-col gap-1 justify-between">
						<FileUploadButton
							name={"uploadedFile"}
							onFileChange={setFiles}
							buttonChildren={<PaperclipIcon />}
						/>
						<Button
							size="icon"
							disabled={
								aiFetcher.state === "submitting" || !fields.prompt.value
							}
							type="submit"
						>
							{aiFetcher.state === "submitting" ? (
								<LoaderCircleIcon className="animate-spin" />
							) : (
								<ForwardIcon />
							)}
						</Button>
					</div>
				</div>
			</aiFetcher.Form>
		</div>
	);
}
export interface FileUploadButtonRef {
	clearInput: () => void;
}

const FileUploadButton = React.forwardRef<
	FileUploadButtonRef,
	{
		name: string;
		onFileChange: (files: FileList) => void;
		buttonChildren: React.ReactNode;
	}
>(({ onFileChange, buttonChildren, name }, ref) => {
	const fileInputRef = React.useRef<HTMLInputElement | null>(null);

	React.useImperativeHandle(ref, () => ({
		clearInput: () => {
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
	}));

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) {
			return;
		}
		console.log("::FILES", event.target.files);
		if (files.length > 0) {
			onFileChange(files);
		}
	};

	return (
		<div>
			<input
				onClick={(event) => {
					//Strange issue: https://stackoverflow.com/questions/12030686/html-input-file-selection-event-not-firing-upon-selecting-the-same-file
					const el = event.target as HTMLInputElement;
					el.value = "";
				}}
				ref={fileInputRef}
				type="file"
				name={name}
				className="hidden"
				onChange={handleFileChange}
			/>
			<Button size="icon" type="button" onClick={handleButtonClick}>
				{buttonChildren}
			</Button>
		</div>
	);
});
