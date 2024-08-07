export interface IStorageProvider {
	getSignedUrl(name: string): Promise<string>;
	uploadFile(
		data: AsyncIterable<Uint8Array>,
		destination: string,
		name: string,
	): Promise<string>;
}
