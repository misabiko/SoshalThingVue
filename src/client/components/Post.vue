<template lang='pug'>
	ArticleSkeleton.post(
		:article-id='postId'
		:post-data='postData'
		:show-media='showMedia'
		:compact-media='compactMedia'
	)
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import {Getter} from 'vuex-class';
import {PostData} from '../../core/PostData';
import ArticleSkeleton from './ArticleSkeleton.vue';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';

@Component({
	components: {ArticleSkeleton, PostImages, PostVideo}
})
export default class Post extends Vue {
	@Prop({type: String, required: true})
	readonly postId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;

	@Getter readonly getPost!: (id: string) => PostData;

	get postData() : PostData {
		return this.getPost(this.postId);
	}
}
</script>