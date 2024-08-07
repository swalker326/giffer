import { useFetcher } from "@remix-run/react";
import { action as uploadAction } from "~/routes/upload";

export default function Test() {
	const uploadFetcher = useFetcher<typeof uploadAction>();
	const image = uploadFetcher.data?.file;
	return (
		<uploadFetcher.Form
			method="POST"
			action="/upload"
			encType="multipart/form-data"
		>
			<input type="file" name="uploadedFileUrl" />
			{image && (
				<img
					className="w-40 h-40 object-cover rounded-md"
					src={image}
					alt="Uploaded image"
				/>
			)}
			<button
				className="border bg-purple-500 p-2 py-3 text-white rounded-md"
				type="submit"
			>
				Upload
			</button>
		</uploadFetcher.Form>
	);
}
