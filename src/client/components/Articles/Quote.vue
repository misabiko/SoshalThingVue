<template lang='pug'>
	ArticleSkeleton.quote(
		:service='service'
		:article-id='quoteId'
		:post-data='quoteData'
		:show-media='false'
	)
		template(v-slot:extra-content)
			.quotedPost
				a.names(:href='service.getUserURL(postData.authorHandle)' target='_blank' rel='noopener noreferrer')
					strong {{ postData.authorName }}
					small {{'@' + postData.authorHandle}}
				p {{ postData.text }}

				PostImages.postMedia(
					v-if='showMedia && postData.images'
					:images='postData.images'
					:compact='compactMedia'
					@expanded='expandPost($event)'
				)
				PostVideo.postMedia(
					v-if='showMedia && postData.video'
					:video='postData.video'
					@expanded='expandPost(0)'
				)
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {PostData, QuoteData} from '../../../core/PostData';
import {Prop} from 'vue-property-decorator';
import {Mutation} from 'vuex-class';
import {ExpandedPost} from '../../store';
import ArticleSkeleton from './ArticleSkeleton.vue';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';
import {Service} from '../../services/service';

@Component({components: {ArticleSkeleton, PostImages, PostVideo}})
export default class Quote extends Vue {
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: String, required: true})
	readonly quoteId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;

	@Mutation('expandPost') storeExpandPost!: (post : ExpandedPost) => void;

	get quoteData() : QuoteData {
		return this.service.quotes[this.quoteId];
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