<template lang='pug'>
	ArticleSkeleton.quote(
		:service='service'
		:article-id='articleId'
		:post-data='quoteData'
		:show-media='false'
		:timeline-hidden='timelineHidden'
		:timeline-compact-override='timelineCompactOverride'
		@set-hidden="$emit('set-hidden', $event)"
		@set-compact-override="$emit('set-compact-override', $event)"
	)
		template(v-slot:extra-content)
			.quotedPost
				ArticleHeader(
					:service='service'
					:handle='postData.authorHandle'
					:userName='postData.authorName'
					:creationTime='postData.creationTime'
				)
				ArticleParagraph(:article-id='postId' :post-data='postData')

				PostImages.postMedia(
					v-if='showMedia && postData.images'
					:images='postData.images'
					:compact='compactMedia'
					@expanded='expandPost({service, id: postId, selectedMedia: $event})'
				)
				PostVideo.postMedia(
					v-if='showMedia && postData.video'
					:video='postData.video'
					@expanded='expandPost({service, id: postId, selectedMedia: 0})'
				)
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {PostData, QuoteData} from '../../../core/PostData';
import {Prop} from 'vue-property-decorator';
import {Mutation} from 'vuex-class';
import {ExpandedPost} from '../../store';
import ArticleSkeleton, {CompactOverride} from './ArticleSkeleton.vue';
import ArticleParagraph from './ArticleParagraph.vue';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';
import {Service} from '../../services/service';
import ArticleHeader from './ArticleHeader.vue';

@Component({components: {ArticleSkeleton, ArticleParagraph, ArticleHeader, PostImages, PostVideo}})
export default class Quote extends Vue {
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: String, required: true})
	readonly articleId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;
	@Prop({type: Boolean})
	readonly timelineHidden!: boolean;
	@Prop({type: Number, default: CompactOverride.Inherit})
	readonly timelineCompactOverride!: number;

	@Mutation('expandPost') expandPost!: (post : ExpandedPost) => void;

	get quoteData() : QuoteData {
		return this.service.quotes[this.articleId];
	}

	get postId() : string {
		return this.quoteData.quotedId;
	}

	get postData() : PostData {
		return this.service.posts[this.postId];
	}
}
</script>

<style scoped lang='sass'>
@use '../../bulma_overrides' as *

.quotedPost
	border: 2px solid $scheme-main-ter
	border-radius: 6px
	padding: 16px

	.names
		text-overflow: ellipsis
		white-space: nowrap
		overflow: hidden
		display: inline-block
		max-width: 300px

		strong
			margin-right: 0.5rem
			color: $white-ter

		&:hover > *
			text-decoration: underline

	span *
			vertical-align: middle

	p
		white-space: pre-line
</style>