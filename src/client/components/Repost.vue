<template lang='pug'>
	ArticleSkeleton.repost(
		:article-id='repostId'
		:post-data='postData'
		:show-media='showMedia'
	)
		template(v-slot:header)
			.repostLabel(v-if='repostData.reposterName')
				p {{ repostData.reposterName + ' retweeted' }}
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {PostData, RepostData} from '../../core/PostData';
import {Prop} from 'vue-property-decorator';
import {Getter} from 'vuex-class';
import ArticleSkeleton from './ArticleSkeleton.vue';
import PostVideo from './PostVideo.vue';
import PostImages from './PostImages.vue';

@Component({components: {ArticleSkeleton, PostImages, PostVideo}})
export default class Repost extends Vue {
	@Prop({type: String, required: true})
	readonly repostId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;

	@Getter readonly getRepost!: (id: string) => RepostData;
	@Getter readonly getPost!: (id: string) => PostData;

	get repostData() : RepostData {
		return this.getRepost(this.repostId);
	}

	get postId() : string {
		return this.repostData.repostedId;
	}

	get postData() : PostData {
		return this.getPost(this.postId);
	}
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

.repostLabel
	margin-left: 64px
	color: $light
	font-size: smaller

	p
		margin-left: 1rem
</style>