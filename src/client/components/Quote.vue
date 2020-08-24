<template lang='pug'>
	ArticleSkeleton.quote(
		:article-id='quoteId'
		:post-data='postData'
		:show-media='false'
	)
		template(v-slot:extra-content)
			.quotedPost
				span.names
					strong {{ postData.authorName }}
					small {{'@' + postData.authorHandle}}
				p {{ postData.text }}

				PostImages.postMedia(
					v-if='showMedia && postData.images'
					:images='postData.images'
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
import {PostData, QuoteData} from '../../core/PostData';
import {Prop} from 'vue-property-decorator';
import {Action, Getter, Mutation} from 'vuex-class';
import {ExpandedPost} from '../store';
import ArticleSkeleton from './ArticleSkeleton.vue';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';

@Component({components: {ArticleSkeleton, PostImages, PostVideo}})
export default class Quote extends Vue {
	@Prop({type: String, required: true})
	readonly quoteId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;

	@Getter readonly getQuote!: (id: string) => QuoteData;
	@Getter readonly getPost!: (id: string) => PostData;
	@Action('toggleLike') actionToggleLike!: (id : string) => void;
	@Action('repost') actionRepost!: (id : string) => void;

	@Mutation('expandPost') storeExpandPost!: (post : ExpandedPost) => void;

	get quoteData() : QuoteData {
		return this.getQuote(this.quoteId);
	}

	get postId() : string {
		return this.quoteData.quotedId;
	}

	get postData() : PostData {
		return this.getPost(this.postId);
	}
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

.quotedPost
	border: 2px solid $scheme-main-ter
	border-radius: 6px
	padding: 16px
</style>