<template>
	<div class='timeline' :class='{ mainTimeline }'>
		<div class='timelineHeader'>
			<strong>{{ timeline.title }}</strong>
			<div class='timelineButtons'>
				<button @click='getNewArticles()'>
					<span class='icon'>
						<i class='fa-arrow-down fas fa-lg'></i>
					</span>
				</button>
				<button @click='showOptions = !showOptions'>
					<span class='icon'>
						<i class='fa-ellipsis-v fas fa-lg'></i>
					</span>
				</button>
			</div>
		</div>
		<div class='timelineOptions' v-if='showOptions'>
			<div class='box'>
				<label class='checkbox'>
					<input type='checkbox' v-model='showHidden'>
					Show hidden
				</label>
			</div>
			<div class='box'>
				Sort Method:
				<div class='select'>
					<select v-model='sortMethod'>
						<option v-for='sort in Object.keys(sortMethods)' :value='sort'>{{ sort }}</option>
					</select>
				</div>
				<label class='checkbox'>
					<input type='checkbox' v-model='sortReversed'>
					Reversed
				</label>
			</div>
			<div class='box'>
				On article click:
				<div class='select'>
					<select v-model='onArticleClick'>
						<option v-for='action in Object.keys(onArticleClicks)' :value='action'>{{ action }}</option>
					</select>
				</div>
			</div>
			<div class='box'>
				<div class='control'>
					<label class='radio' v-for='c in containers'>
						<input
							type='radio'
							:value='c'
							@change='$emit("changeContainer", $event.target.value)'
							:checked='c === timeline.container'
						>
						{{ c }}
					</label>
				</div>
			</div>
		</div>
		<component
			:is='timeline.container'
			:articles='articles'
			:showHidden='showHidden'
			:onArticleClick='onArticleClicks[onArticleClick]'
			@expand='modalArticle = $event'
		></component>
		<Modal
			v-if='modalArticle.length'
			:article='service.articles[modalArticle]'
			:onArticleClick='onArticleClicks[onArticleClick]'
			@close='modalArticle = ""'
		></Modal>
	</div>
</template>

<script lang='ts'>
import {defineComponent, ref, computed, PropType, onBeforeMount, provide} from 'vue'
import {Article} from '@/articles'
import {Service} from '@/services'

export interface TimelineData {
	title: string
	serviceIndex: number
	endpointIndex : number
	container : string
}

export default defineComponent({
	props: {
		timeline: {
			type: Object as PropType<TimelineData>,
			required: true
		},
		mainTimeline: Boolean,
	},
	setup(props) {
		const service = ref(Service.instances[props.timeline.serviceIndex])
		const articleIds = ref<string[]>([])

		const showHidden = ref(false)

		const sortMethods : { [method : string] : (array : Article[]) => Article[] } = {
			Unsorted: (articles : Article[]) => articles,
			Id: (articles : Article[]) => articles.sort((a : Article, b : Article) => parseInt(b.id) - parseInt(a.id)),
		}

		const sortMethod = ref('Unsorted')

		const sortReversed = ref(false)

		const articles = computed(() => {
				let sorted = sortMethods[sortMethod.value](
					articleIds.value.map((id : string) => service.value.articles[id]),
				)
				if (sortReversed.value)
					sorted = sorted.reverse()

				return sorted
			},
		)

		const getNewArticles = async () => {
			for (const id of await service.value.getNewArticles(props.timeline.endpointIndex, {}))
				if (!articleIds.value.includes(id))
					articleIds.value.push(id)
		}

		const showOptions = ref(false)
		const modalArticle = ref('')

		onBeforeMount(getNewArticles)

		const onArticleClicks = {
			Hide: (id : string) => service.value.toggleHideArticle(id),
			Log: (id : string) => console.dir(service.value.articles[id]),
			Expand: (id : string) => modalArticle.value = id,
		}

		const onArticleClick = ref('Hide')

		provide('service', service)

		return {
			service,
			articles,
			showHidden,
			sortMethods, sortMethod, sortReversed,
			getNewArticles,
			showOptions,
			modalArticle,
			onArticleClicks, onArticleClick,
		}
	},
})
</script>

<style scoped lang='sass'>
@use '../sass/core' as *

.timeline
	@include pretty-scrollbar

	color: $text
	height: 100%
	padding: 0 5px
	box-sizing: border-box
	display: flex
	flex-flow: column

	&:first-child
		padding: 0

.timeline.mainTimeline
	flex-grow: 2

.timelineHeader
	height: 50px
	line-height: 50px
	padding-left: 25px
	background-color: $dark
	display: flex
	justify-content: space-between

	strong
		vertical-align: middle

	&.timelineInvalid
		background-color: $dark-error

	& .icon i
		color: $white-ter

.timelineLeftHeader
	display: flex

.timelineButtons > button
	@include borderless-button(0 1.6rem)
	height: 100%

.timelineOptions
	background-color: $scheme-main-ter
	padding: 1rem
	display: flex
	flex-direction: column
	align-items: flex-start

	& input[type="number"]
		width: 200px
</style>
