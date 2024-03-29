import {FilterConfigs} from '@/composables/useFilters'
import {SortConfig} from '@/composables/useSortMethods'

export interface TimelineData {
	title : string
	serviceName : string
	articleList : string
	endpointName? : string
	endpointOptions? : any
	container : string
	filters : FilterConfigs
	showFiltered? : boolean
	sortConfig : SortConfig
	rtl? : boolean
	size? : number
	columnCount? : number
	autoRefresh : boolean
	compactArticles : boolean
	articleSection : {
		enabled : boolean
		start : number
		end : number
		expandStep : number
	}
}