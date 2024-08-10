export function combineHeaders(
	...headers: Array<ResponseInit["headers"] | null | undefined>
) {
	const combined = new Headers();
	for (const header of headers) {
		if (!header) continue;
		for (const [key, value] of new Headers(header).entries()) {
			combined.append(key, value);
		}
	}
	return combined;
}

/**
 * Combine multiple response init objects into one (uses combineHeaders)
 */
export function combineResponseInits(
	...responseInits: Array<ResponseInit | null | undefined>
) {
	let combined: ResponseInit = {};
	for (const responseInit of responseInits) {
		combined = {
			...responseInit,
			headers: combineHeaders(combined.headers, responseInit?.headers),
		};
	}
	return combined;
}

export async function downloadFile(url: string, retries = 0) {
	const MAX_RETRIES = 3;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch image with status ${response.status}`);
		}
		const contentType = response.headers.get("content-type") ?? "image/jpg";
		const blob = Buffer.from(await response.arrayBuffer());
		return { contentType, blob };
	} catch (e) {
		if (retries > MAX_RETRIES) throw e;
		return downloadFile(url, retries + 1);
	}
}
