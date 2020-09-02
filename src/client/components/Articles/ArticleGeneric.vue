<template lang='pug'>
	Post(
		v-if='isPost'
		:key='article.id'
		:service='service'
		:postId='article.id'
		:timeline-hidden='timelineHidden'
		:timeline-compact-override='timelineCompactOverride'
		:compact-media='compactMedia'
		@remove='removeArticle($event)'
		@set-hidden="$emit('set-hidden', $event)"
		@set-compact-override="$emit('set-compact-override', $event)"
	)
	Repost(
		v-else-if='isRepost'
		:key='article.id'
		:service='service'
		:repostId='article.id'
		:timeline-hidden='timelineHidden'
		:timeline-compact-override='timelineCompactOverride'
		:compact-media='compactMedia'
		@remove='removeArticle($event)'
		@set-hidden="$emit('set-hidden', $event)"
		@set-compact-override="$emit('set-compact-override', $event)"
	)
	Quote(
		v-else
		:key='article.id'
		:service='service'
		:quoteId='article.id'
		:timeline-hidden='timelineHidden'
		:timeline-compact-override='timelineCompactOverride'
		:compact-media='compactMedia'
		@remove='removeArticle($event)'
		@set-hidden="$emit('set-hidden', $event)"
		@set-compact-override="$emit('set-compact-override', $event)"
	)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import Post from './Post.vue';
import Repost from './Repost.vue';
import Quote from './Quote.vue';
import {Article, ArticleType} from '../../../core/PostData';
import {Service} from '../../services/service';
import {CompactOverride} from './ArticleSkeleton.vue';

@Component({components: {Post, Repost, Quote}})
export default class ArticleGeneric extends Vue {
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: Object, required: true})
	readonly article!: Article;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;
	@Prop({type: Boolean})
	readonly timelineHidden!: boolean;
	@Prop({type: Number, default: CompactOverride.Inherit})
	readonly timelineCompactOverride!: number;

	//TODO Redo with render function
	get isPost() {
		return this.article.type === ArticleType.Post;
	}

	get isRepost() {
		return this.article.type === ArticleType.Repost;
	}
}
</script>