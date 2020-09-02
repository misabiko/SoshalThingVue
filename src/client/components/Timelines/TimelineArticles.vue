<template lang='pug'>
	.timelineArticles(v-if='columns === 1' @scroll="$emit('scroll', $event)" @wheel="$emit('wheel', $event)")
		ArticleGeneric(
			v-for='article in articles'
			:key='article.id'
			:service='service'
			:article='article'
			:compact-media='compactMedia'
			@remove="$emit('remove-article', $event)"
		)
	.timelineArticles(
		v-else
		:key='columns'
		@scroll="$emit('scroll', $event)"
		@wheel="$emit('wheel', $event)"
	)
		masonry(:cols='columns')
			ArticleGeneric(
				v-for='article in articles'
				:key='article.id'
				:service='service'
				:article='article'
				:compact-media='compactMedia'
				@remove="$emit('remove-article', $event)"
			)
</template>

<script lang='ts'>
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import ArticleGeneric from '../Articles/ArticleGeneric.vue';
import {Article} from '../../../core/PostData';
import {Service} from '../../services/service';

@Component({components: {ArticleGeneric}})
export default class TimelineArticles extends Vue {
	@Prop({type: Number, required: true})
	readonly columns! : number;
	@Prop({type: Array, required: true})
	readonly articles! : Article[];
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: Boolean, required: true})
	readonly compactMedia!: boolean;
	@Prop({type: Boolean})
	readonly scrolling!: boolean;

	scrollDirection = false;
	scrollRequestId = 0;
	scrollSpeed = 3;

	autoScroll(scrollUp : boolean) {
		this.scrollDirection = scrollUp;
		this.stopScroll();
		const scrollStep = () => {
			if ((this.scrollDirection && this.$el.scrollTop > 0) ||
				(!this.scrollDirection && this.$el.scrollTop < this.$el.scrollHeight - window.innerHeight))
				this.$el.scrollBy(0, this.scrollDirection ? -this.scrollSpeed : this.scrollSpeed);
			else
				this.scrollDirection = !this.scrollDirection;
			this.scrollRequestId = window.requestAnimationFrame(scrollStep);
		}
		this.scrollRequestId = window.requestAnimationFrame(scrollStep);
		this.addScrollStopper();
	}

	stopScroll() {
		window.cancelAnimationFrame(this.scrollRequestId);
		this.scrollRequestId = 0;
	}

	addScrollStopper() {
		window.addEventListener("mousedown", () => {
			this.stopScroll();
			this.$emit('update:scrolling', false);
		}, {
			once: true
		});
	}

	@Watch('scrolling')
	onScrollChange(newScrolling : boolean) {
		if (newScrolling)
			this.autoScroll(false);
		else
			this.stopScroll();
	}
}
</script>

<style scoped lang='sass'>
.timelineArticles
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
	height: 100%
</style>