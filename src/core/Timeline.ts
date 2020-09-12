export interface TimelineData {
	id?: number;
	name: string;
	service: string;
	endpoint: string;
	autoRefresh: boolean;
	enabled: boolean;
	compactMedia: boolean;
	refreshRate: number;
	columns: number;
	columnWidth: number;
	options: TimelineOptions;
}

export interface TimelineOptions {
	q?: string;
	since?: string;
	max?: string;
	count?: number;
	userId?: string;
	userHandle?: string;
	listId?: string;
	listSlug?: string;
	includeReposts: boolean;
	onlyWithMedia: boolean;
}

export const defaultTimeline : TimelineData = {
	name: '',
	service: '',
	endpoint: '',
	autoRefresh: true,
	enabled: true,
	compactMedia: true,
	columns: 1,
	columnWidth: 1,
	options: {
		includeReposts: true,
		onlyWithMedia: false,
	},
	refreshRate: 90000,
};