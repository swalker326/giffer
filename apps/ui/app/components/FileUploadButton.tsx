import { FetcherWithComponents } from "@remix-run/react";
import { Button } from "./ui/button";
import React from "react";
import { SerializeFrom } from "@remix-run/node";
import { LoaderCircleIcon } from "lucide-react";

export function FileUploadButton({
	icon,
	action,
	fetcher,
}: {
	icon: React.ReactNode;
	action: string;
	fetcher: FetcherWithComponents<
		SerializeFrom<{
			file: string;
		}>
	>;
}) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const fileObject = e.target.files?.[0];
		if (fileObject?.name) {
			const fd = new FormData();
			fd.append("uploadedFileUrl", fileObject);
			fetcher.submit(fd, {
				action: action,
				method: "post",
				encType: "multipart/form-data",
			});
		}
	};
	return (
		<div>
			<input
				ref={inputRef}
				type="file"
				className="hidden"
				id="fileUpload"
				name="uploadedFileUrl"
				onChange={handleChange}
			/>
			<Button
				type="button"
				onClick={() => {
					inputRef.current?.click();
				}}
			>
				{fetcher.state === "idle" ? (
					icon
				) : (
					<LoaderCircleIcon className="animate-spin" />
				)}
			</Button>
		</div>
	);
}
