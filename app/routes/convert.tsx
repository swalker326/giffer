import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import type { ErrorBoundaryComponent } from "node_modules/@sentry/remix/build/types/utils/vendor/types";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import { LoaderIcon } from "~/components/LoaderIcon";
import { convertMovToGif } from "~/models/file.server";

export async function action({ request }: ActionFunctionArgs) {
	try {
		const body = await request.formData();
		const file = body.get("file");
		if (file instanceof File) {
			console.log("Its a file");
			const gif = await convertMovToGif(file);

			if (!gif)
				return json({ error: "Could not convert file" }, { status: 500 });
			return json({ gif });
		}
		throw new Error("No file found");
	} catch (e) {
		Sentry.captureException(e);
		if (e instanceof Error) {
			return json({ error: e.message }, { status: 500 });
		}
		return json({ error: "Something went wrong" }, { status: 500 });
	}
}

interface ConvertFormProps {
	setFile: Dispatch<SetStateAction<string>>;
}

export const ConvertForm = ({ setFile }: ConvertFormProps) => {
	const fetcher = useFetcher<{ gif: string; error: string }>();
	const inputRef = useRef<HTMLInputElement>(null);
	const dropRef = useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [fileSelected, setFileSelected] = useState(false);
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFileSelected(true);
		}
	};

	useEffect(() => {
		function base64ToImgUrl(base64: string): string {
			const binaryString = atob(base64);
			const array = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				array[i] = binaryString.charCodeAt(i);
			}
			const blob = new Blob([array], { type: "image/gif" });
			return URL.createObjectURL(blob);
		}
		if (fetcher.data?.gif) {
			const getFileurl = async () => {
				if (!fetcher.data?.gif) throw new Error("No gif found");
				setFile(base64ToImgUrl(fetcher.data?.gif));
			};
			getFileurl();
		}
	}, [fetcher.data, setFile]);

	useEffect(() => {
		setIsLoading(fetcher.state === "loading" || fetcher.state === "submitting");
	}, [fetcher.state]);

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		dropRef.current?.classList.remove("animate-wiggle");
		dropRef.current?.classList.remove("bg-purple-100");
		const file = e.dataTransfer.files[0];
		if (file) {
			if (inputRef.current) {
				const dt = new DataTransfer();
				dt.items.add(file);
				inputRef.current.files = dt.files;
				setFileSelected(true);
			}
		}
	};
	return (
		<fetcher.Form
			method="post"
			action={"/convert"}
			encType="multipart/form-data"
		>
			<div className="flex-col items-center justify-center">
				{fetcher.data?.error ? (
					<div className="my-2 rounded-md bg-red-200 p-2 text-red-500">
						<h3 className="font-xl text-center">Something went wrong</h3>
						<p className="text-center">{fetcher.data.error}</p>
					</div>
				) : null}
				<label>
					<div
						ref={dropRef}
						onDrop={handleDrop}
						onDragOver={(e) => {
							e.preventDefault();
							dropRef.current?.classList.add("bg-purple-200");
							dropRef.current?.classList.add("animate-wiggle");
						}}
						onDragLeave={(e) => {
							e.preventDefault();
							dropRef.current?.classList.remove("animate-wiggle");
							dropRef.current?.classList.remove("bg-purple-100");
						}}
						className="relative flex min-h-[110px] w-full flex-col items-center rounded-sm border border-dashed border-purple-500 p-3"
					>
						<h3 className="mb-2 text-2xl">Drop a file or</h3>
						<input
							ref={inputRef}
							name="file"
							type="file"
							accept="video/mp4,video/x-m4v,video/*"
							onChange={handleFileChange}
							className="file:text-md py-2 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-purple-500 file:py-2 file:px-6 file:font-medium file:text-white hover:file:cursor-pointer hover:file:bg-purple-700 "
						/>
						<button
							className=" absolute bottom-1 right-1 flex h-7 w-20 items-center justify-center rounded-md bg-purple-500 py-2 px-4 text-white enabled:hover:bg-purple-700  disabled:text-gray-300 disabled:opacity-60"
							type="submit"
							disabled={isLoading || !fileSelected}
						>
							{isLoading ? (
								<div className="h-fit w-fit">
									<LoaderIcon />
								</div>
							) : (
								"Convert"
							)}
						</button>
					</div>
				</label>
			</div>
		</fetcher.Form>
	);
};

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="text-2xl font-bold">Something went wrong in convert</h1>
			<p className="text-lg">{error.message}</p>
		</div>
	);
};
