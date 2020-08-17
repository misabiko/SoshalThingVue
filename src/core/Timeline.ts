export interface TimelineData {
	id: number,
	name: string,
	service: string,
	endpoint: string,
	refreshRate: number,
	options: TimelineOptions,
}

export interface TimelineOptions {
	q?: string
}