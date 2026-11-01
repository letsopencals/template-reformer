import type { FeedbackQuestionResponse } from '@opencals/storefront-sdk';

/** A feedback question ("How was your class?") as the account page renders it. */
export interface FeedbackQuestionView {
	id: string;
	type: FeedbackQuestionResponse['type'];
	required: boolean;
	title: string;
	description: string | null;
	options: string[];
}
