<template lang='pug'>
	.card
		.card-image: figure.image
			img(:src='imageURL')
		.card-content: Post(v-if='expandedPost.id.length' :postId="expandedPost.id" :show-media='false')
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import Post from './Post.vue';
import {ExpandedPost} from '../store';
import {Getter, State} from 'vuex-class';
import {PostData} from '../../core/PostData';

@Component({components: {Post}})
export default class PostCard extends Vue {
	@State expandedPost!: ExpandedPost;

	@Getter readonly getPost!: (id: string) => PostData;

	get imageURL() : string {
		if (!this.expandedPost.id.length)
			return '';

		const images = this.getPost(this.expandedPost.id).images;
		return images ? images[this.expandedPost.selectedMedia].url : '';
	}
}
</script>