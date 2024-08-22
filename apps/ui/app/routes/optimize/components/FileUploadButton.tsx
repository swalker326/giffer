import React from "react";
import { Button } from "~/components/ui/button";
import type { FileUploadButtonRef } from "./ConversationInput";

export const FileUploadButton = React.forwardRef<
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
