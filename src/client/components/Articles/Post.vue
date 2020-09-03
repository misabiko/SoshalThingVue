<template lang='pug'>
	ArticleSkeleton.post(
		:service='service'
		:article-id='articleId'
		:post-data='postData'
		:show-media='showMedia'
		:compact-media='compactMedia'
		:timeline-hidden='timelineHidden'
		:timeline-compact-override='timelineCompactOverride'
		@set-hidden="$emit('set-hidden', $event)"
		@set-compact-override="$emit('set-compact-override', $event)"
	)
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import {PostData} from '../../../core/PostData';
import ArticleSkeleton, {CompactOverride} from './ArticleSkeleton.vue';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';
import {Service} from '../../services/service';

@Component({
	components: {ArticleSkeleton, PostImages, PostVideo}
})
export default class Post extends Vue {
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

	get postData() : PostData {
		return this.service.posts[this.articleId];
	}
}
</script>