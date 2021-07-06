import {FilterConfigs} from '@/composables/useFilters'
import {SortConfig} from '@/composables/useSortMethods'

export interface TimelineData {
	title : string
	serviceIndex : number
	articleList : string
	endpointIndex? : number
	endpointOptions? : any
	container : string
	filters : FilterConfigs
	sortConfig : SortConfig
	rtl? : boolean
	size? : number
	columnCount? : number
}