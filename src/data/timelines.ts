export interface TimelineData {
	title : string
	serviceIndex : number
	endpointIndex? : number
	container : string
	defaults? : {
		rtl? : boolean
		size? : number
	}
}

export interface TimelineDataSerialized extends TimelineData {
	endpointOptions? : any
}