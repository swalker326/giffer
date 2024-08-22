import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import {
	ForwardIcon,
	LoaderCircleIcon,
	PaperclipIcon,
	XIcon,
} from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import type { action as sendMessageAction } from "~/routes/message.send";
import { MediaPreview } from "./MediaPreview";
import { FileUploadButton } from "~/routes/optimize/components/FileUploadButton";
import { ErrorContainer } from "./ErrorContainer";

export interface FileUploadButtonRef {
	clearInput: () => void;
}

export function ConversationInput() {
	const fileUploadButtonRef = React.useRef<FileUploadButtonRef | null>(null);
	const aiFetcher = useFetcher<typeof sendMessageAction>();
	const [files, setFiles] = React.useState<FileList | undefined>();
	const [errors, setErrors] = React.useState<
		{ error: Error; command: string }[] | undefined
	>();

	React.useEffect(() => {
		if (aiFetcher.state === "submitting" || aiFetcher.state === "loading") {
			setErrors(undefined);
		} else if (aiFetcher.state === "idle") {
			setErrors(aiFetcher.data?.errors);
		}
	}, [aiFetcher.state, aiFetcher.data]);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const params = useParams();
	const conversationId = params.conversationId;
	return (
		<div className="sm:container sm:max-w-4xl sm:mx-auto py-4">
			<div className="w-full relative">
				{errors && errors.length > 0 && (
					<ErrorContainer
						title="We've run into some problems"
						handleClick={() => {
							setErrors(undefined);
						}}
						content={errors[0].command}
					/>
				)}
				{aiFetcher.data?.formErrors && aiFetcher.data.formErrors.length > 0 && (
					<ErrorContainer
						title="We've run into some problems"
						handleClick={() => {}}
						content={aiFetcher.data.formErrors[0]}
					/>
				)}
			</div>
			<aiFetcher.Form
				action="/message/send"
				method="POST"
				encType="multipart/form-data"
			>
				<input type="hidden" name="conversationId" value={conversationId} />
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
						name="prompt"
						// {...getInputProps(fields.prompt, { type: "text" })}
						className="text-lg border-none flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-3 ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-none focus-visible:ring-transparent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="What do you want to do?"
					/>
					{/* <div id={fields.prompt.errorId}>{fields.prompt.errors}</div> */}
					<div className="flex flex-col gap-1 justify-between">
						<FileUploadButton
							name={"uploadedFile"}
							onFileChange={setFiles}
							buttonChildren={<PaperclipIcon />}
						/>
						<Button
							size="icon"
							// disabled={
							// 	aiFetcher.state === "submitting" || !fields.prompt.value
							// }
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
