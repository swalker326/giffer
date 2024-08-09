export interface IStorageProvider {
		getSignedUrl(name: string): Promise<string>;
		uploadFile({
			data,
			destination,
			name,
		}: {
			data: AsyncIterable<Uint8Array>;
			destination: string;
			name: string;
		}): Promise<string>;
	}
