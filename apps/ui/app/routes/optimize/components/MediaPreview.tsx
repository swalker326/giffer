import React from "react";
import { useEffect } from "react";
import { set } from "zod";

export function MediaPreview({
	fileList,
}: {
	fileList: FileList;
}) {
	const file = fileList[0];
	const [extension, setExtension] = React.useState("");
	const [isVideo, setIsVideo] = React.useState(false);
	useEffect(() => {
		const fileExt = file.name.split(".").pop();
		if (fileExt) {
			setExtension(fileExt);
			setIsVideo(["mp4", "webm", "mov", "avi"].includes(fileExt));
		}
	});
	return (
		<div className="flex items-center justify-center w-12 h-12">
			{isVideo ? (
				<video autoPlay loop muted src={URL.createObjectURL(file)} />
			) : (
				<img
					src={URL.createObjectURL(file)}
					alt="Media Preview"
					className="max-w-full max-h-full"
				/>
			)}
		</div>
	);
}
