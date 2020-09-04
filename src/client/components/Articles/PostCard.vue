<template lang='pug'>
	.card
		.card-image
			b-carousel(:arrow='images.length > 1' :indicator='false' :autoplay='false')
				b-carousel-item(v-for='(image, index) in images' :key='index')
					figure.image: img(:src='image.url')
		.card-content: Post(v-if='expandedPost.id.length' :service='expandedPost.service' :articleId="expandedPost.id" :show-media='false')
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {State} from 'vuex-class';
import Post from './Post.vue';
import {ExpandedPost} from '../../store';
import {PostImageData} from '../../../core/PostData';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faAngleLeft, faAngleRight} from '@fortawesome/free-solid-svg-icons';

library.add(faAngleLeft, faAngleRight);

@Component({components: {Post}})
export default class PostCard extends Vue {
	@State expandedPost!: ExpandedPost;

	get images() : PostImageData[] {
		if (!(this.expandedPost.id.length && this.expandedPost.service))
			return [];

		const post = this.expandedPost.service.posts[this.expandedPost.id];

		if (post.images && post.images.length) {
			const imagesCopy = Array.from(post.images);
			for (let i = 0; i < this.expandedPost.selectedMedia; ++i)
				imagesCopy.push(imagesCopy.shift() as PostImageData);

			return imagesCopy;
		}

		return [];
	}
}
</script>

<style lang='sass'>
@use '../../bulma_overrides' as *

@include pretty-scrollbar
</style>