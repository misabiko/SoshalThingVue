<template>
	<article class='article' :articleId='actualArticle.id'>
<!--		superheader-->
		<div class='media'>
			<figure class='media-left'>
				<p class='image is-64x64'>
					<img :src='actualArticle.author.avatarURL' :alt="actualArticle.author.handle + '\'s avatar'">
				</p>
			</figure>
			<div class='media-content'>
				<div class='content'>
					<div class='articleHeader'>
						<a
							class='names'
							:href='service.getUserURL(actualArticle.author.handle)'
							target='_blank'
							rel='noopener noreferrer'
							@click.left.prevent='addUserTimeline(actualArticle.author.handle)'
						>
							<strong>{{ actualArticle.author.name }}</strong>
							<small>@{{actualArticle.author.handle}}</small>
						</a>
						<span class='timestamp'>
							<small title='long time!'>short time!</small>
						</span>
					</div>
					<div v-if='actualArticle.type !== TwitterArticleType.Retweet' class='tweet-paragraph'>{{ actualArticle.text }}</div>
				</div>
<!--			extra-->
				<nav class='level is-mobile'>
					<div class='level-left'>
						<a
							class='level-item articleButton repostButton'
							:class='{repostedPostButton: actualArticle.reposted}'
						>
						<span class='icon'>
							<FontAwesomeIcon icon='retweet'/>
						</span>
							<span v-if='actualArticle.repostCount'>{{actualArticle.repostCount}}</span>
						</a>
						<a
							class='level-item articleButton likeButton'
							:class='{likedPostButton: actualArticle.liked}'
						>
						<span class='icon'>
							<FontAwesomeIcon :icon='[actualArticle.liked ? "fas" : "far", "heart"]'/>
						</span>
							<span v-if='actualArticle.likeCount'>{{actualArticle.likeCount}}</span>
						</a>
						<a class='level-item articleButton articleMenuButton'>
						<span class='icon'>
							<FontAwesomeIcon icon='ellipsis-h'/>
						</span>
						</a>
					</div>
				</nav>
			</div>
		</div>
<!--		footer-->
	</article>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, toRefs} from 'vue'
import {TwitterArticle, TwitterService, TwitterArticleType, RetweetArticle, QuoteArticle} from '@/services/twitter'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faEllipsisH, faHeart as fasHeart, faRetweet} from '@fortawesome/free-solid-svg-icons'
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons'

library.add(faRetweet, fasHeart, farHeart, faEllipsisH)

export default defineComponent({
	props: {
		service: {
			type: Object as PropType<TwitterService>,
			required: true,
		},
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
		const {article, service} = toRefs(props)

		const actualArticle = computed<TwitterArticle>(() => {
			switch (article.value.type) {
				case TwitterArticleType.Tweet:
					return article.value
				case TwitterArticleType.Retweet:
					return service.value.articles[(article.value as RetweetArticle).retweetedId]
				case TwitterArticleType.Quote:
					return service.value.articles[(article.value as QuoteArticle).quotedId]
			}
		})

		function addUserTimeline(handle : string) {
			console.log('boop ' + handle)
		}

		return {service, addUserTimeline, TwitterArticleType, actualArticle}
	}
})
</script>

<style scoped lang='sass'>
@use '../../sass/core' as *

article.article
	padding: 1rem
	background-color: $scheme-main-bis
	margin-bottom: 2px

	figure img
		border-radius: 4px

.postMedia
	margin-top: 1rem

.articleHeader *
	vertical-align: middle

	small
		color: $light

.names
	text-overflow: ellipsis
	white-space: nowrap
	overflow: hidden
	display: inline-block
	max-width: 300px

	strong
		margin-right: 0.5rem
		color: $white-ter

	&:hover > *
		text-decoration: underline

.timestamp
	float: right
</style>