export const MediaMessage = ({
	media,
}: { media: { fileName: string; url: string } }) => {
	const mediaType = media.fileName.split(".").pop();
	return (
		<div>
			{mediaType === "mp4" ? (
				<video muted autoPlay loop controls className="w-full h-32">
					<source src={media.url} type="video/mp4" />
				</video>
			) : mediaType === "webm" ? (
				<video muted autoPlay loop className="w-full h-32">
					<source src={media.url} type="video/webm" />
				</video>
			) : mediaType === "png" ||
				mediaType === "jpg" ||
				mediaType === "jpeg" ||
				mediaType === "gif" ? (
				<img src={media.url} alt="results" className="w-full" />
			) : (
				<a href={media.url} target="_blank" rel="noreferrer">
					{media.url}
				</a>
			)}
		</div>
	);
};
