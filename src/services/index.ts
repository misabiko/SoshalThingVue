export interface Article {
	id: string
}

export abstract class Service {
	public articles: {[id: string]: Article} = {}

	protected constructor() {}
}

export const services: Service[] = []