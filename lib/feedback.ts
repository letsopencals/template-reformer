export type FeedbackQuestionType = 'single-line-text-field' | 'multi-line-text-field' | 'dropdown' | 'rating' | 'checkbox' | 'file-upload';

/** A feedback question ("How was your class?") as the account page renders it. */
export interface FeedbackQuestionView {
	id: string;
	type: FeedbackQuestionType;
	required: boolean;
	title: string;
	description: string | null;
	options: string[];
}
