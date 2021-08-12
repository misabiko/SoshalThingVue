import './setup'
import {expect} from 'chai'
import {mount} from '@vue/test-utils'
import {Service} from '@/services'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {TimelineData} from '@/data/timelines'
import {MockService} from './Service.spec'
import Timeline from '@/components/Timeline.vue'

describe('Timelines', () => {
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
			endpoints: [],
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

		it('collapsed checkbox matches timelineData',  async() => {
			for (const compact of [true, false]) {
				const timelineData : TimelineData = {
					...baseTimelineData,
					compactArticles: compact,
				}

				const wrapper = mount(Timeline, {
					props: {
						timeline: timelineData,
					},
					global: {
						components: {FontAwesomeIcon},
					},
				})

				await wrapper.get('.showOptions').trigger('click')
				const compactCheckbox = wrapper.get<HTMLInputElement>('.compactArticles')

				expect(compactCheckbox.element.checked).to.be.equal(compact)
			}
		})
	})
})