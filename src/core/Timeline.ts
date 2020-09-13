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
	showing: string[];
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
}

export enum TimelineFilter {
	All = 'all',
	Reposts = 'reposts',
	Quotes = 'quotes',
	TextOnly = 'text',
	Images = 'images',
	Videos = 'videos',
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
	showing: [TimelineFilter.All],
	options: {},
	refreshRate: 90000,
};