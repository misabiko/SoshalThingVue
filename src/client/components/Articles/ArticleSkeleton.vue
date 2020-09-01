<template lang='pug'>
	article.article(:article-id='articleId' @mouseover='hovered = true' @mouseleave='hovered = false')
		slot(name='header')

		.media
			figure.media-left
				p.image.is-64x64: img(
					:alt=`postData.authorHandle + "'s avatar"`
					:src='postData.authorAvatar'
				)

			.media-content(v-if='hidden')
				.content: ArticleHeader(
					:service='service'
					:handle='postData.authorHandle'
					:userName='postData.authorName'
					:creationTime='postData.creationTime'
				)
				ArticleButtons(
					:service='service'
					:post-data='postData'
					:compact-media='compactMedia'
					:compact-override.sync='compactOverride'
					:hidden.sync='hidden'
				)
			.media-content(v-else)
				.content
					ArticleHeader(
						:service='service'
						:handle='postData.authorHandle'
						:userName='postData.authorName'
						:creationTime='postData.creationTime'
					)
					ArticleParagraph(:article-id='articleId' :post-data='postData')

				slot(name='extra-content')

				ArticleButtons(
					:service='service'
					:post-data='postData'
					:compact-media='compactMedia'
					:compact-override.sync='compactOverride'
					:hidden.sync='hidden'
				)
			//-.media-right
		slot(name='footer' v-if='!hidden')
			PostImages.postMedia(
				v-if='showMedia && postData.images'
				:images='postData.images'
				:compact='compact'
				@expanded='expandPost($event)'
			)
			PostVideo.postMedia(
				v-if='showMedia && postData.video'
				:video='postData.video'
				@expanded='expandPost(0)'
			)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {Mutation} from 'vuex-class';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';
import ArticleParagraph from './ArticleParagraph.vue';
import ArticleButtons from './ArticleButtons/ArticleButtons.vue';
import ArticleHeader from './ArticleHeader.vue';
import {Service} from '../../services/service';
import {PostData} from '../../../core/PostData';
import {ExpandedPost} from '../../store';

export enum CompactOverride {
	Inherit = 0,
	Compact,
	Expand,
}

@Component({components: {ArticleHeader: ArticleHeader, ArticleButtons, ArticleParagraph, PostImages, PostVideo}})
export default class ArticleSkeleton extends Vue {
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: String, required: true})
	readonly articleId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;
	@Prop({type: Object, required: true})
	readonly postData!: PostData;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;

	@Mutation('expandPost') storeExpandPost!: (post : ExpandedPost) => void;

	hovered = false;
	hidden = false;
	compactOverride = CompactOverride.Inherit;

	expandPost(selectedMedia: number) {
		this.storeExpandPost({service: this.service, id: this.postData.id, selectedMedia});
	}

	get compact() {
		if (this.compactOverride === CompactOverride.Inherit)
			return this.compactMedia;
		else
			return this.compactOverride === CompactOverride.Compact;
	}
}
</script>

<style scoped lang='sass'>
@use '../../bulma_overrides' as *

article.article
	padding: 1rem
	background-color: $scheme-main-bis
	margin-bottom: 2px

	figure img
		border-radius: 4px

.postMedia
	margin-top: 1rem
</style>