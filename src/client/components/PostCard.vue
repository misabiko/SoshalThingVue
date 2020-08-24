<template lang='pug'>
	.card
		.card-image
			b-carousel(:indicator='false' :autoplay='false')
				b-carousel-item(v-for='(image, index) in images' :key='index')
					figure.image: img(:src='image.url')
		.card-content: Post(v-if='expandedPost.id.length' :postId="expandedPost.id" :show-media='false')
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {Getter, State} from 'vuex-class';
import Post from './Post.vue';
import {ExpandedPost} from '../store';
import {PostData, PostImageData} from '../../core/PostData';

@Component({components: {Post}})
export default class PostCard extends Vue {
	@State expandedPost!: ExpandedPost;

	@Getter readonly getPost!: (id: string) => PostData;

	get images() : PostImageData[] {
		if (!this.expandedPost.id.length)
			return [];

		return this.getPost(this.expandedPost.id).images || [];
	}
}
</script>

<style lang='sass'>
@use '../bulma_overrides' as *

@include pretty-scrollbar
</style>