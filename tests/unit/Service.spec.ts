import './setup'
import {expect} from 'chai'
import {mount} from '@vue/test-utils'
import {Endpoint, EndpointTypeInfoGetter, Payload, Service} from '@/services'
import TweetArticle from '@/components/Articles/TweetArticle.vue'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import App from '@/App.vue'
import {TimelineData} from '@/data/timelines'

export class MockService extends Service {
	constructor() {
		super('MockService', [MockEndpoint.typeInfo], TweetArticle, false)
	}

	getAPIArticleData(id : string) : Promise<any> {
		return Promise.resolve(undefined)
	}

	getExternalLink(id : string) : string {
		return ''
	}
}

class MockEndpoint extends Endpoint<{}> {
	static typeInfo : EndpointTypeInfoGetter = () => ({
		typeName: MockEndpoint.name,
		name: 'Mock Endpoint',
		factory() {return new MockEndpoint()},
		optionComponent: () => null,
	})

	constructor() {
		super(MockEndpoint.name)
	}

	call(options : {}) : Promise<Payload> {
		return Promise.resolve({articles: [], newArticles: []})
	}
}

describe('Services', () => {
	let service : MockService
	before(() => {
		service = Service.addService(new MockService())
	})

	after(() => {
		delete Service.instances.MockService
	})

	describe('Endpoints', () => {
		const baseTimelineData : TimelineData = {
			title: 'Timeline1',
			articleList: 'Timeline1',
			serviceName: 'MockService',
			container: 'ColumnContainer',
			filters: {},
			sortConfig: {
				method: 'Unsorted',
				reversed: false
			},
			autoRefresh: true,
			compactArticles: false,
			articleSection: {
				enabled: true,
				start: 0,
				end: 30,
				expandStep: 50,
			},
		}

		it('uses options as endpoint name', () => {
			const endpoint = new MockEndpoint()

			expect(JSON.stringify(endpoint.getKeyOptions())).to.be.equal('{"endpointType":"MockEndpoint"}')
		})

		it('does not throw for invalid endpoint types', () => {
			const timelineDatas : TimelineData[] = [{
				...baseTimelineData,
				endpointOptions: {
					endpointType: 'InvalidEndpointType'
				}
			}]

			const wrapper = mount(App, {
				global: {
					components: {FontAwesomeIcon},
				},
			})

			expect(() => wrapper.vm.initTimelineDatas(timelineDatas)).to.not.throw()
		})

		it('parses endpoint options', () => {
			const endpointOptions = {endpointType: MockEndpoint.typeInfo(service).typeName}
			const timelineDatas : TimelineData[] = [{
				...baseTimelineData,
				endpointOptions
			}]

			const wrapper = mount(App, {
				global: {
					components: {FontAwesomeIcon},
				},
			})

			const initializedTimelineDatas = wrapper.vm.initTimelineDatas(timelineDatas)
			const timelineEndpointName = initializedTimelineDatas[0].endpointName

			const endpointName = JSON.stringify(endpointOptions)
			expect(service.endpoints).to.own.property(endpointName)
			expect(timelineEndpointName).to.be.equal(endpointName)
		})
	})
})