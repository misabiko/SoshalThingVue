<template lang='pug'>
	article.article(:article-id='articleId' @mouseover='hovered = true' @mouseleave='hovered = false')
		slot(name='header')

		.media
			figure.media-left
				p.image.is-64x64: img(
					:alt=`postData.authorHandle + "'s avatar"`
					:src='postData.authorAvatar'
				)

			.media-content
				.content
					span.names
						strong {{ postData.authorName }}
						small {{'@' + postData.authorHandle}}
					span.timestamp: small(:title='creationTimeLong') {{ creationTimeShort }}
					ArticleParagraph(
						:article-id='articleId'
						:post-data='postData'
					)

				slot(name='extra-content')

				ArticleButtons(:post-data='postData' :compact-media='compactMedia' :compact-override.sync='compactOverride')
			//-.media-right
		slot(name='footer')
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
import {PostData} from '../../core/PostData';
import moment from 'moment';
import {ExpandedPost} from '../store';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';
import ArticleParagraph from './ArticleParagraph.vue';
import ArticleButtons from './ArticleButtons.vue';

//TODO Move this to external file
moment.defineLocale('twitter', {
	relativeTime: {
		future: "in %s",
		past:   "%s ago",
		s  : 'a few seconds',
		ss : '%ds',
		m:  "a minute",
		mm: "%dm",
		h:  "an hour",
		hh: "%dh",
		d:  "a day",
		dd: "%dd",
		M:  "a month",
		MM: "%dm",
		y:  "a year",
		yy: "%dy"
	}
});
//TODO Fix locale not switching back
moment().locale('en');

export enum CompactOverride {
	Inherit = 0,
	Compact,
	Expand,
}

@Component({components: {ArticleButtons, ArticleParagraph, PostImages, PostVideo}})
export default class ArticleSkeleton extends Vue {
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
	compactOverride = CompactOverride.Inherit;

	expandPost(selectedMedia: number) {
		this.storeExpandPost({id: this.postData.id, selectedMedia});
	}

	get creationTimeShort() : string {
		const t = moment(this.postData.creationTime).locale('twitter').fromNow(true);
		moment().locale('en');
		return  t;
	}

	get creationTimeLong() : string {
		return moment(this.postData.creationTime).fromNow();
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
@use '../bulma_overrides' as *

article.article
	padding: 1rem
	background-color: $scheme-main-bis
	margin-bottom: 2px

	figure img
		border-radius: 4px

	.content
		.names
			text-overflow: ellipsis
			white-space: nowrap
			overflow: hidden
			display: inline-block
			max-width: 300px

		span
			*
				vertical-align: middle

			strong
				margin-right: 0.5rem

	small
		color: $light

.timestamp
	float: right

.postMedia
	margin-top: 1rem
</style>