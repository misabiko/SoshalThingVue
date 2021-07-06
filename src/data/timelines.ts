import {FilterConfigs} from '@/composables/useFilters'

export interface TimelineData {
	title : string
	serviceIndex : number
	articleList : string
	endpointIndex? : number
	endpointOptions? : any
	container : string
	filters : FilterConfigs
	rtl? : boolean
	size? : number
	columnCount? : number
}