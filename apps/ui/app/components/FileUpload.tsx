import type { SetStateAction } from "react";
import React from "react";
import { LoaderIcon } from "./LoaderIcon";

export function FileUpload({
	setFile,
}: { setFile: React.Dispatch<SetStateAction<File | null>> }) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const dropRef = React.useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [fileSelected, setFileSelected] = React.useState(false);
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFileSelected(true);
		}
	};
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
		<div className="flex-col items-center justify-center">
			{/* {fetcher.data?.error ? (
				<div className="my-2 rounded-md bg-red-200 p-2 text-red-500">
					<h3 className="font-xl text-center">Something went wrong</h3>
					<p className="text-center">{fetcher.data.error}</p>
				</div>
			) : null} */}
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
						accept="video/mp4,video/x-m4v,video/*,image/*"
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
							"Upload"
						)}
					</button>
				</div>
			</label>
		</div>
	);
}
