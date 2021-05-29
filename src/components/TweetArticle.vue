<template>
	<article class='article' :articleId='article.id'>
<!--		superheader-->
		<div class='media'>
			<figure class='media-left'>
				<p class='image is-64x64'>
					<img :src='article.authorAvatar' :alt="article.authorHandle + '\'s avatar'">
				</p>
			</figure>
			<div class='media-content'>
				<div class='content'>
<!--					Header-->
					<div class='tweet-paragraph'>{{article.content}}</div>
				</div>
			</div>
<!--			extra-->
			<nav class='level is-mobile'>
				<div class='level-left'>
					<a
						class='level-item articleButton repostButton'
						:class='{repostedPostButton: article.reposted}'
					>
						<span class='icon'>
							<i class='retweet fas'></i>
						</span>
						<span v-if='article.repostCount'>{{article.repostCount}}</span>
					</a>
					<a
						class='level-item articleButton likeButton'
						:class='{likedPostButton: article.liked}'
					>
						<span class='icon'>
							<i class='fa-heart' :class='article.liked ? "fas" : "far"'></i>
						</span>
						<span v-if='article.likeCount'>{{article.likeCount}}</span>
					</a>
					<a class='level-item articleButton articleMenuButton'>
						<span class='icon'>
							<i class='fa-ellipsis-h fas'></i>
						</span>
					</a>
				</div>
			</nav>
		</div>
<!--		footer-->
	</article>
</template>

<script lang='ts'>
import {defineComponent, inject, PropType} from 'vue'
import {Service} from '@/services'
import {TwitterArticle} from '@/services/Twitter'

export default defineComponent({
	props: {
		onArticleClick: {
			type: Function,
			required: true,
		},
		article: {
			type: Object as PropType<TwitterArticle>,
			required: true,
		},
	},

	setup(props) {
		const service = inject<Service>('service')
		if (!service)
			throw "Article wasn't provided a service"

		return {service}
	}
})
</script>

<style scoped lang='sass'>

</style>