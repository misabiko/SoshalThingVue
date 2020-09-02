<template lang='pug'>
	ArticleSkeleton.repost(
		:service='service'
		:article-id='repostId'
		:post-data='postData'
		:show-media='showMedia'
		:compact-media='compactMedia'
		:timeline-hidden='timelineHidden'
		:timeline-compact-override='timelineCompactOverride'
		@set-hidden="$emit('set-hidden', $event)"
		@set-compact-override="$emit('set-compact-override', $event)"
	)
		template(v-slot:header)
			.repostLabel(v-if='repostData.reposterName')
				a(:href='service.getUserURL(repostData.reposterHandle)' target='_blank' rel='noopener noreferrer')
					| {{ repostData.reposterName + ' retweeted' }}
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {PostData, RepostData} from '../../../core/PostData';
import {Prop} from 'vue-property-decorator';
import ArticleSkeleton, {CompactOverride} from './ArticleSkeleton.vue';
import PostVideo from './PostVideo.vue';
import PostImages from './PostImages.vue';
import {Service} from '../../services/service';

@Component({components: {ArticleSkeleton, PostImages, PostVideo}})
export default class Repost extends Vue {
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: String, required: true})
	readonly repostId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;
	@Prop({type: Boolean})
	readonly timelineHidden!: boolean;
	@Prop({type: Number, default: CompactOverride.Inherit})
	readonly timelineCompactOverride!: number;

	get repostData() : RepostData {
		return this.service.reposts[this.repostId];
	}

	get postId() : string {
		return this.repostData.repostedId;
	}

	get postData() : PostData {
		return this.service.posts[this.postId];
	}
}
</script>

<style scoped lang='sass'>
@use '../../bulma_overrides' as *

.repostLabel
	margin-left: 64px
	color: $light
	font-size: smaller

	a
		margin-left: 1rem
		color: $light

		&:hover
			text-decoration: underline
</style>