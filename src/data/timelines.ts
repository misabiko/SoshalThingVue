export interface TimelineData {
	title : string
	serviceIndex : number
	endpointIndex? : number
	container : string
	rtl? : boolean
	size? : number
	columnCount? : number
}

export interface TimelineDataSerialized extends TimelineData {
	endpointOptions? : any
}