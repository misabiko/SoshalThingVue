export interface TimelineData {
	id: number,
	name: string,
	service: string,
	endpoint: string,
	autoRefresh: boolean,
	refreshRate: number,
	options: TimelineOptions,
}

export interface TimelineOptions {
	q?: string
}