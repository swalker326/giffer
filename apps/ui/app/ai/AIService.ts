import type {
	AIAdapter,
	AIAdapterPayload,
	AIAdapterResponse,
} from "./AIAdapter";

export class AIService {
	private adapter: AIAdapter;

	constructor(adapter: AIAdapter) {
		this.adapter = adapter;
	}

	setAdapter(adapter: AIAdapter) {
		this.adapter = adapter;
	}

	async submitPrompt(payload: AIAdapterPayload): Promise<AIAdapterResponse> {
		return this.adapter.submitPrompt(payload);
	}
}
