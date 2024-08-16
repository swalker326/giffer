export default function OptimizeIndex() {
	return (
		<div className="overflow-y-auto h-full">
			<section className="bg-gray-200 py-10">
				<div className="container mx-auto px-4 flex flex-col items-center">
					<h2 className="text-2xl font-bold text-center text-gray-800">
						Simplify Your GIF and Video Creation
					</h2>
					<p className="text-lg text-center text-gray-600 mt-4 max-w-2xl">
						With Giffer, you can easily generate and run complex FFmpeg commands
						for GIF and video creation without needing to master the syntax.
						Just describe what you want, and let our AI handle the rest.
					</p>
					<button
						type="button"
						className="mt-8 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300"
					>
						Get Started
					</button>
				</div>
			</section>

			<section className="py-10">
				<div className="container mx-auto px-4">
					<h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
						Why Choose Giffer?
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-white p-6 rounded-lg shadow-lg">
							<h3 className="text-xl font-semibold text-gray-800">
								AI-Generated FFmpeg Commands
							</h3>
							<p className="text-gray-600 mt-4">
								Describe your GIF or video creation needs, and Giffer generates
								the necessary FFmpeg commands for you.
							</p>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-lg">
							<h3 className="text-xl font-semibold text-gray-800">
								User-Friendly Interface
							</h3>
							<p className="text-gray-600 mt-4">
								No need to learn complex FFmpeg syntax. Giffer’s intuitive
								interface makes it easy to create stunning GIFs and videos with
								just a few clicks.
							</p>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-lg">
							<h3 className="text-xl font-semibold text-gray-800">
								Advanced Capabilities
							</h3>
							<p className="text-gray-600 mt-4">
								Harness the full power of FFmpeg through Giffer. Perform
								advanced video processing and GIF creation tasks effortlessly.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-purple-600 py-10">
				<div className="container mx-auto px-4 text-center text-white">
					<h2 className="text-2xl font-bold">
						Start Creating with Giffer Today
					</h2>
					<p className="text-lg mt-4 max-w-xl mx-auto">
						Sign up today and start simplifying your GIF and video creation with
						AI-driven FFmpeg commands.
					</p>
					<button
						type="submit"
						className="mt-8 bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-300"
					>
						Sign Up Now
					</button>
				</div>
			</section>
		</div>
	);
}
