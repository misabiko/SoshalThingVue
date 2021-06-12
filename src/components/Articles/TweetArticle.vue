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
							<FontAwesomeIcon icon='retweet'/>
						</span>
						<span v-if='article.repostCount'>{{article.repostCount}}</span>
					</a>
					<a
						class='level-item articleButton likeButton'
						:class='{likedPostButton: article.liked}'
					>
						<span class='icon'>
							<FontAwesomeIcon :icon='[article.liked ? "fas" : "far", "heart"]'/>
						</span>
						<span v-if='article.likeCount'>{{article.likeCount}}</span>
					</a>
					<a class='level-item articleButton articleMenuButton'>
						<span class='icon'>
							<FontAwesomeIcon icon='ellipsis-h'/>
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
import {library} from '@fortawesome/fontawesome-svg-core'
import {faEllipsisH, faHeart as fasHeart, faRetweet} from '@fortawesome/free-solid-svg-icons'
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons'

library.add(faRetweet, fasHeart, farHeart, faEllipsisH)

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