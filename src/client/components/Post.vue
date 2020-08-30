<template lang='pug'>
	ArticleSkeleton.post(
		:service='service'
		:article-id='postId'
		:post-data='postData'
		:show-media='showMedia'
		:compact-media='compactMedia'
	)
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import {PostData} from '../../core/PostData';
import ArticleSkeleton from './ArticleSkeleton.vue';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';
import {Service} from '../services/service';

@Component({
	components: {ArticleSkeleton, PostImages, PostVideo}
})
export default class Post extends Vue {
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: String, required: true})
	readonly postId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;

	get postData() : PostData {
		return this.service.posts[this.postId];
	}
}
</script>