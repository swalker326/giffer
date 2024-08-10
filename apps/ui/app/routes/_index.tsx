import type { ErrorBoundaryComponent } from "node_modules/@sentry/remix/build/types/utils/vendor/types";
import { useEffect, useRef, useState } from "react";
import loop from "/assets/loop.gif";
import { ConvertForm } from "./convert";

export default function Index() {
	const [file, setFile] = useState<string>(loop);
	const sliderRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const interval = setInterval(() => {
			if (sliderRef.current) {
				// biome-ignore lint/suspicious/noAssignInExpressions: idfk
				const top = (sliderRef.current.scrollTop += 48);
				if (top >= sliderRef.current.scrollHeight) {
					sliderRef.current.scrollTo({ top: 0 });
				} else {
					sliderRef.current.scrollTo({ top, behavior: "smooth" });
				}
			}
		}, 2000);
		return () => {
			clearInterval(interval);
		};
	});

	return (
		<main className="relative flex min-h-screen justify-center bg-white px-2 py-4">
			<div className="mx-auto flex flex-col justify-between">
				<div>
					<div>
						<header className="my-2 rounded-lg  bg-black py-3 text-white">
							<div className="group flex items-center justify-center space-x-1">
								<h1 className="flex items-center text-2xl font-medium">
									Upload a
								</h1>
								<div
									ref={sliderRef}
									className="flex h-10 flex-col justify-start space-y-2 overflow-hidden text-2xl"
								>
									<LoopItem>.mov</LoopItem>
									<LoopItem>.mp4</LoopItem>
									<LoopItem>.m4v</LoopItem>
									<LoopItem>.avi</LoopItem>
									<LoopItem>.wmv</LoopItem>
									<LoopItem>.flv</LoopItem>
								</div>
							</div>
						</header>
						<ConvertForm setFile={setFile} />
						{file && (
							<div className="group mt-4 flex w-full items-start justify-center">
								<a className="relative" download href={file}>
									<button
										type="button"
										className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-purple-600 py-2 px-4 font-medium text-white transition-opacity duration-700 ease-in-out md:opacity-0 md:group-hover:opacity-70"
									>
										Download
									</button>
									<img style={{ width: "400px" }} src={file} alt="gif" />
								</a>
							</div>
						)}
					</div>
				</div>
				<footer className="w-full py-2 text-center text-xs text-gray-500">
					<p>
						Made with{" "}
						<a
							className="text-purple-500"
							href="https://remix.run/"
							target="_blank"
							rel="noreferrer"
						>
							Remix Run
						</a>{" "}
						and{" "}
						<a
							className="text-purple-500"
							href="https://ffmpeg.org/"
							target="_blank"
							rel="noreferrer"
						>
							ffmpeg
						</a>{" "}
						by{" "}
						<a
							className="text-purple-500"
							href="https://twitter.com/swalker326"
							target="_blank"
							rel="noreferrer"
						>
							@swalker326
						</a>
					</p>
				</footer>
			</div>
		</main>
	);
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="text-2xl font-bold">Something went wrong</h1>
			<p className="text-lg">{error.message}</p>
		</div>
	);
};

const LoopItem = ({ children }: { children: React.ReactNode }) => {
	return (
		<span className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 px-2 py-1 text-2xl text-white">
			{children}
		</span>
	);
};
