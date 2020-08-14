<template>
	<div class='post' :post-id='data.id'>
		<div
			v-if='data.reposterName'
			class='respostLabel'
		>
			{{ data.reposterName + ' retweeted' }}
		</div>
		<div class='postSide'>
			<img
				:alt="data.authorHandle + '\'s avatar'"
				:src='data.authorAvatar'
				/>
		</div>
		<span>
			{{ data.authorName }}
			{{ '@' + data.authorHandle }}
		</span>
		<p>{{ data.text }}</p>
		<PostMedia v-if='data.images' :sources='data.images'></PostMedia>
		<div class='postButtons'>
			<button
				class='repostButton'
				:class='{repostedPostButton: data.reposted}'
				@click='repost'
			>
				<FontAwesomeIcon icon='retweet'></FontAwesomeIcon>
			</button>
			<button
				class='likeButton'
				:class='{likedPostButton: data.liked}'
				@click='like'
			>
				<FontAwesomeIcon :icon="[data.liked ? 'fas' : 'far', 'heart']"></FontAwesomeIcon>
			</button>
		</div>
	</div>
</template>

<script lang='ts'>
import Vue, {PropType} from 'vue';
import {PostData} from '../core/PostData';
import PostMedia from './PostMedia.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faHeart as fasHeart, faRetweet} from '@fortawesome/free-solid-svg-icons';
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons';

library.add(fasHeart, farHeart, faRetweet);

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
.post
	background-color: #181925
	position: relative
	padding: 8px 8px 8px 20%
	margin-bottom: 2px

.postSide
	position: absolute
	left: 0

.post p
	margin: 0

.repostLabel
	color: #8899a6
	padding: 5px 0
	font-size: smaller

.postButtons button
	margin: 8px 0

.postButtons button
	border: 0
	margin-right: 10px
	background: none
	color: #8899a6

.postButtons i
	font-size: 18px

button:hover.likeButton i, .likedPostButton i
	color: #e0245e

button:hover.repostButton i, .repostedPostButton i
	color: #17bf63

button:hover.commentButton i
	color: #1da1f2

.postSide img
	margin: 5px 16px
	border-radius: 4px
</style>