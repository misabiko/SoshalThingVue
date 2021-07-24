import './setup'
import {expect} from 'chai'
import {mount} from '@vue/test-utils'
import {Service} from '@/services'
import TweetArticle from '@/components/Articles/TweetArticle.vue'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import App from '@/App.vue'
import {TimelineData} from '@/data/timelines'

class MockService extends Service {
	constructor() {
		super('MockService', {}, TweetArticle, false)
	}

	getAPIArticleData(id : string) : Promise<any> {
		return Promise.resolve(undefined)
	}

	getExternalLink(id : string) : string {
		return ''
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
		it('does not throw for invalid endpoint types', () => {
			const timelineDatas : TimelineData[] = [{
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
	})
})