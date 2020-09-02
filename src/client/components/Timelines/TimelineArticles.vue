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
		@scroll="$emit('scroll', $event)"
		@wheel="$emit('wheel', $event)"
	)
		masonry(
			:cols='columns'
			css="{height: '100%'}"
		)
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
import {Vue, Component, Prop} from 'vue-property-decorator';
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
}
</script>

<style scoped lang='sass'>
.timelineArticles
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
	height: 100%
</style>