<template>
	<article class='post' :post-id='data.id'>
		<div class='respostLabel' v-if='data.reposterName'>
			<p>{{ data.reposterName + ' retweeted' }}</p>
		</div>
		<div class='media'>
			<figure class='media-left'>
				<p class='image is-64x64'>
					<img
						:alt="data.authorHandle + '\'s avatar'"
						:src='data.authorAvatar'
					/>
				</p>
			</figure>
			<div class='media-content'>
				<div class='content'>
					<p>
						<strong class='has-text-light'>{{ data.authorName }}</strong> <small>{{
							'@' + data.authorHandle
						}}</small> <small>sometime</small>
						<br>
						{{ data.text }}
					</p>
				</div>
				<nav class='level is-mobile'>
					<div class='level-left'>
						<a class='level-item commentButton'>
							<span class='icon is-small'><FontAwesomeIcon icon='reply'/></span>
						</a>
						<a class='level-item repostButton' :class='{repostedPostButton: reposted}' @click='reposted = !reposted'>
							<span class='icon is-small'><FontAwesomeIcon icon='retweet'/></span>
						</a>
						<a class='level-item likeButton' :class='{likedPostButton: liked}' @click='liked = !liked'>
							<span class='icon is-small'><FontAwesomeIcon :icon="[liked ? 'fas' : 'far', 'heart']"/></span>
						</a>
					</div>
				</nav>
			</div>
			<div class='media-right'>
				<button class='delete'></button>
			</div>
		</div>
		<PostMedia v-if='data.images' :sources='data.images'></PostMedia>
	</article>
</template>

<script lang='ts'>
import Vue, {PropType} from 'vue';
import {PostData} from '../core/PostData';
import PostMedia from './PostMedia.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faHeart as fasHeart, faRetweet, faReply} from '@fortawesome/free-solid-svg-icons';
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons';

library.add(fasHeart, farHeart, faRetweet, faReply);

export default Vue.component('Post', {
	props: {
		data: {
			type: Object as PropType<PostData>,
			required: true,
		},
	},
	data: function() {
		return {
			liked: this.data.liked,
			reposted: this.data.reposted,
		}
	},
	methods: {
		async like() {
			const json = await fetch('twitter/like/' + this.data.id, {method: 'POST'})
				.then(response => response.json());

			this.liked = json.favorited;
		},
		async repost() {
			const json = await fetch('twitter/retweet/' + this.data.id, {method: 'POST'})
				.then(response => response.json());

			this.reposted = json.reposted;
		},
	},
	components: {
		PostMedia,
	},
});
</script>

<style scoped lang='sass'>
@use '../variables' as *

article.post
	padding: 1rem
	background-color: $post-color
	margin-bottom: 2px

	figure img
		border-radius: 4px

	a
		color: #8899a6

		&:hover.likeButton, &.likedPostButton
			svg
				color: #e0245e

		&:hover.repostButton, &.repostedPostButton
			svg
				color: #17bf63

		&:hover.commentButton svg
			color: #1da1f2

.respostLabel
	margin-left: 64px
	color: #8899a6
	font-size: smaller

	p
		margin-left: 1rem
</style>