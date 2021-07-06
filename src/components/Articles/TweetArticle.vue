<template>
	<article class='article' :articleId='article.id' :referencedId='actualArticle.id'>
		<div v-if='article.type === TwitterArticleType.Retweet' class='repostLabel'>
			<a
				:href='service.getUserURL(article.author.handle)'
				target='_blank'
				rel='noopener noreferrer'
			>{{ article.author.name}} retweeted</a>
		</div>
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
					<div class='tweet-paragraph'>{{ actualArticle.text }}</div>
				</div>
<!--			extra-->
				<nav class='level is-mobile'>
					<div class='level-left'>
						<a
							class='level-item articleButton repostButton'
							:class='{repostedPostButton: actualArticle.reposted}'
							@click='actualArticle.reposted || service.retweet(actualArticle.id)'
						>
							<span class='icon'>
								<FontAwesomeIcon icon='retweet'/>
							</span>
							<span v-if='actualArticle.repostCount'>{{actualArticle.repostCount}}</span>
						</a>
						<a
							class='level-item articleButton likeButton'
							:class='{likedPostButton: actualArticle.liked}'
							@click='service.like(actualArticle.id)'
						>
							<span class='icon'>
								<FontAwesomeIcon :icon='[actualArticle.liked ? "fas" : "far", "heart"]'/>
							</span>
							<span v-if='actualArticle.likeCount'>{{actualArticle.likeCount}}</span>
						</a>
						<div class='dropdown' :class='{"is-active": showDropdown}'>
							<div class='dropdown-trigger'>
								<a class='level-item articleButton articleMenuButton'
								   aria-haspopup='true'
								   aria-controls='dropdown-menu'
								   @click='showDropdown = !showDropdown'
								>
									<span class='icon'>
										<FontAwesomeIcon icon='ellipsis-h'/>
									</span>
								</a>
							</div>
							<div class='dropdown-menu'>
								<div class='dropdown-content'>
									<div class='dropdown-item' @click='service.toggleHideArticle(article.id)'>Hide</div>
									<div class='dropdown-item' @click='service.logArticle(article.id)'>Log</div>
								</div>
							</div>
						</div>
					</div>
				</nav>
			</div>
		</div>
		<div v-if='actualArticle.media.length && actualArticle.media[0].type === MediaType.Image' class='postMedia postImages' :class='{postImagesCompact: compact}'>
			<div
				class='mediaHolder'
				v-for='(mediaData, i) in actualArticle.media'
				:class="[compact ? 'mediaHolderCompact' : '', imageFormatClass(i), actualArticle.media.length === 3 && i === 2 ? 'thirdImage' : '']"
			>
				<div class='is-hidden imgPlaceholder'/>
				<img :alt='actualArticle.id' :src='mediaData.status === MediaLoadStatus.ThumbnailOnly ? mediaData.thumbnail.url : mediaData.content.url' @click='$emit("expanded", i)'/>
			</div>
		</div>
		<div v-else-if='actualArticle.media.length && actualArticle.media[0].type === MediaType.Video' class='postMedia postVideo'>
			<div class='is-hidden imgPlaceholder'/>
			<video controls :autoplay='false' :loop='false'>
				<source :src='actualArticle.media[0].content.url' type='video/mp4'/>
			</video>
		</div>
	</article>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, ref, toRaw, toRefs} from 'vue'
import {
	TwitterArticle,
	TwitterService,
	TwitterArticleType,
	RetweetArticle,
	QuoteArticle,
	TweetArticle,
} from '@/services/twitter'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faEllipsisH, faHeart as fasHeart, faRetweet} from '@fortawesome/free-solid-svg-icons'
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons'
import {MediaLoadStatus, MediaType} from '@/data/articles'

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

		const actualArticle = computed<TweetArticle>(() => {
			switch (article.value.type) {
				case TwitterArticleType.Tweet:
					return article.value as TweetArticle
				case TwitterArticleType.Retweet:
					return service.value.articles[(article.value as RetweetArticle).retweetedId] as TweetArticle
				case TwitterArticleType.Quote:
					return service.value.articles[(article.value as QuoteArticle).quotedId] as TweetArticle
			}
		})

		function addUserTimeline(handle : string) {
			console.log('boop ' + handle)
		}

		const compact = ref(false)

		function imageFormatClass(index : number) : string {
			const media = actualArticle.value.media[index]
			const size = media.status == MediaLoadStatus.ThumbnailOnly ?
				media.thumbnail.size :
				media.content.size
			if (!size)
				return 'portrait'

			return size.width > size.height ? 'landscape' : 'portrait'
		}

		const showDropdown = ref(false)

		return {service, addUserTimeline, TwitterArticleType, MediaLoadStatus, MediaType, actualArticle, compact, imageFormatClass, showDropdown}
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

.postImagesCompact
	display: flex
	flex-wrap: wrap

.mediaHolder
	overflow: hidden
	display: flex
	justify-content: center
	border-radius: 8px

	&:not(:last-child)
		margin-bottom: 2px

	img
		align-self: center
		width: 100%

	&.mediaHolderCompact
		max-height: 16vh
		width: 100%

		&:not(:only-child)
			margin: 2px
			max-width: 49%

			&.landscape img
				width: unset
				height: 110%

			&.portrait img
				width: 110%
				height: unset

		img
			object-fit: cover

		&.thirdImage
			max-width: unset

			&.landscape img
				width: unset
				height: 175%

			&.portrait img
				width: 175%
				height: unset

p.articleParagraph
	white-space: pre-line
	overflow-wrap: anywhere


.postButton
	color: $light

	&:hover span
		color: $primary

	&:hover.commentButton span
		color: $comment-color

.postMenu .dropdown-item:hover
	color: $white
	background-color: $primary

.svg-inline--fa.fa-w-14
	width: 0.875em

.svg-inline--fa.fa-w-18
	width: 1.125em

.svg-inline--fa.fa-w-20
	width: 1em

.fade-enter-active, .fade-leave-active
	transition: opacity .5s

.fade-enter, .fade-leave-to
	opacity: 0


.svg-inline--fa.fa-w-16
	width: 1em

.likeButton
	color: $light

	&:hover, &.likedPostButton
		span
			color: $like-color

@keyframes heart
	0%, 17.5%
		width: 0

.heart-enter-active
	will-change: width
	animation: heart .5s cubic-bezier(.17, .89, .32, 1.49)

.heart-enter
	width: 0

$bubble-d: 2em
$bubble-r: .5 * $bubble-d

.icon > svg
	position: relative

	&:before, &:after
		position: absolute
		z-index: -1
		top: 50%
		left: 50%
		border-radius: 50%
		content: ''

	&::before
		margin: -$bubble-r
		width: $bubble-d
		height: $bubble-d
		background: gold

.svg-inline--fa.fa-w-20
	width: 1.25em

.repostButton
	color: $light

	&:hover, &.repostedPostButton
		span
			color: $repost-color

.icon > svg
	will-change: transform
	transition: transform .5s ease-in-out

.repostedPostButton .icon > svg
	transform: rotate(360deg)

.repostLabel
	margin-left: 64px
	color: $light
	font-size: smaller

	a
		margin-left: 1rem
		color: $light

		&:hover
			text-decoration: underline
</style>