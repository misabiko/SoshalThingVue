export interface TimelineData {
	id: number,
	name: string,
	service: string,
	endpoint: string,
	options: {q?: string},
	refreshRate: number,
}