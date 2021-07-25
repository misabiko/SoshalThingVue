<template>
	<article class='article' :articleId='article.id' :referencedId='actualArticle.id'>
		<div v-if='article.type === TwitterArticleType.Retweet' class='repostLabel'>
			<a
				:href='service.getUserURL(article.author.handle)'
				target='_blank'
				rel='noopener noreferrer'
				@click.left.prevent='addUserTimeline(article.author)'
			>{{ article.author.name }} retweeted</a>
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
							@click.left.prevent='addUserTimeline(actualArticle.author)'
						>
							<strong>{{ actualArticle.author.name }}</strong>
							<small>@{{ actualArticle.author.handle }}</small>
						</a>
						<span class='timestamp'>
							<small :title='actualArticle.creationDate'>{{ timestamp }}</small>
						</span>
					</div>
					<p class='articleParagraph'>{{ actualArticle.text }}</p>
				</div>
				<div v-if='article.type === TwitterArticleType.Quote' class='quotedPost'>
					<div class='articleHeader'>
						<a
							class='names'
							:href='service.getUserURL(refArticle.author.handle)'
							target='_blank'
							rel='noopener noreferrer'
							@click.left.prevent='addUserTimeline(refArticle.author)'
						>
							<strong>{{ refArticle.author.name }}</strong>
							<small>@{{ refArticle.author.handle }}</small>
						</a>
						<span class='timestamp'>
							<small :title='refArticle.creationDate'>{{ timestamp }}</small>
						</span>
					</div>
					<p class='refArticleParagraph'>{{ refArticle.text }}</p>
					<div v-if='refArticle.media.length && refArticle.media[0].type === MediaType.Image'
						 class='postMedia postImages' :class='{postImagesCompact: compact}'>
						<div
							class='mediaHolder'
							v-for='(mediaData, i) in refArticle.media'
							:class="[compact ? 'mediaHolderCompact' : '', imageFormatClass(refArticle, i), refArticle.media.length === 3 && i === 2 ? 'thirdImage' : '']"
						>
							<div class='is-hidden imgPlaceholder'/>
							<img
								:alt='refArticle.id'
								:src='mediaData.status === MediaLoadStatus.ThumbnailOnly ? mediaData.thumbnail.url : mediaData.content.url'
								@click='onArticleClick(article.id)'
							/>
						</div>
					</div>
					<div v-else-if='refArticle.media.length && refArticle.media[0].type === MediaType.Video'
						 class='postMedia postVideo'>
						<div class='is-hidden imgPlaceholder'/>
						<video controls :autoplay='refArticle.media[0].content.autoplay' :loop='refArticle.media[0].content.loop' :muted='refArticle.media[0].content.mute' @click='onArticleClick(article.id)'>
							<source :src='refArticle.media[0].content.url' type='video/mp4'/>
						</video>
					</div>
				</div>
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
							<span v-if='actualArticle.repostCount'>{{ actualArticle.repostCount }}</span>
						</a>
						<a
							class='level-item articleButton likeButton'
							:class='{likedPostButton: actualArticle.liked}'
							@click='service.like(actualArticle.id)'
						>
							<span class='icon'>
								<FontAwesomeIcon :icon='[actualArticle.liked ? "fas" : "far", "heart"]'/>
							</span>
							<span v-if='actualArticle.likeCount'>{{ actualArticle.likeCount }}</span>
						</a>
						<a
							class='level-item articleButton'
							v-if='(actualArticle.media && actualArticle.media.length) || (refArticle.media && refArticle.media.length)'
							@click='compact = !compact'
						>
							<span class='icon'>
								<FontAwesomeIcon :icon='compact ? "expand" : "compress"'/>
							</span>
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
									<div class='dropdown-item' @click='compact = !compact'>{{ compact ? 'Show full' : 'Show compact'}}</div>
									<div class='dropdown-item' @click='service.logArticle(article.id)'>Log</div>
									<div class='dropdown-item' @click='fetchLog'>Fetch Status V1</div>
									<div class='dropdown-item' @click='$emit("expand", article.id)'>Expand</div>
									<a
										class='dropdown-item'
										:href='service.getExternalLink(actualArticle.id)'
										target='_blank' rel='noopener noreferrer'
									>
										External Link
									</a>
									<a
										v-if='article.type === TwitterArticleType.Retweet'
										class='dropdown-item'
										:href='service.getExternalLink(article.id)'
										target='_blank' rel='noopener noreferrer'
									>
										Retweet's External Link
									</a>
								</div>
							</div>
						</div>
					</div>
				</nav>
			</div>
		</div>
		<div v-if='actualArticle.media.length && actualArticle.media[0].type === MediaType.Image'
			 class='postMedia postImages' :class='{postImagesCompact: compact}'>
			<div
				class='mediaHolder'
				v-for='(mediaData, i) in actualArticle.media'
				:class="[compact ? 'mediaHolderCompact' : '', imageFormatClass(actualArticle, i), actualArticle.media.length === 3 && i === 2 ? 'thirdImage' : '']"
			>
				<div class='is-hidden imgPlaceholder'/>
				<img
					:alt='actualArticle.id'
					:src='mediaData.status === MediaLoadStatus.ThumbnailOnly ? mediaData.thumbnail.url : mediaData.content.url'
					@click='onArticleClick(article.id)'
				/>
			</div>
		</div>
		<div v-else-if='actualArticle.media.length && actualArticle.media[0].type === MediaType.Video'
			 class='postMedia postVideo'>
			<div class='is-hidden imgPlaceholder'/>
			<video controls :autoplay='actualArticle.media[0].content.autoplay' :loop='actualArticle.media[0].content.loop' :muted='actualArticle.media[0].content.mute' @click='onArticleClick(article.id)'>
				<source :src='actualArticle.media[0].content.url' type='video/mp4'/>
			</video>
		</div>
	</article>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, ref, toRaw, toRefs, watch} from 'vue'
import {
	TwitterArticle,
	TwitterService,
	TwitterArticleType,
	RetweetArticle,
	QuoteArticle,
	TweetArticle, UserTimelineV1Endpoint, TwitterUser,
} from '@/services/twitter'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faCompress, faEllipsisH, faExpand, faHeart as fasHeart, faRetweet} from '@fortawesome/free-solid-svg-icons'
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons'
import {MediaLoadStatus, MediaType} from '@/data/articles'
import {resetTimelineData} from '@/components/Modals/AddTimelineModal.vue'
import {modal} from '@/composables/ModalManager'
import {Service} from '@/services'

library.add(faRetweet, fasHeart, farHeart, faEllipsisH, faExpand, faCompress)

const monthAbbrevs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
		inheritedCompact: {
			type: Boolean,
			default: true,
		}
	},

	setup(props) {
		const {article} = toRefs(props)

		const service = computed(() => Service.instances.Twitter as TwitterService)
		const actualArticle = computed<TweetArticle>(() => service.value.actualTweet(article.value.id, true))
		const refArticle = computed<TweetArticle>(() => service.value.actualTweet(article.value.id))

		function addUserTimeline(user : TwitterUser) {
			resetTimelineData({
				title: user.name,
				serviceName: 'Twitter',
				endpointOptions: {
					endpointType: UserTimelineV1Endpoint.name,
					userId: user.id,
				},
				filters: {
					Hidden: {
						enabled: true,
						inverted: false,
						config: {},
					},
					HasMedia: {
						enabled: false,
						inverted: false,
						config: {},
					},
					Retweet: {
						enabled: false,
						inverted: true,
						config: {},
					},
				},
			})
			modal.value = 'AddTimelineModal'
		}

		const localCompact = ref<undefined | boolean>()
		const compact = computed({
			get: () => localCompact.value ?? props.inheritedCompact,
			set: v => {
				if (v === props.inheritedCompact)
					localCompact.value = undefined
				else
					localCompact.value = v
			}
		})

		watch(() => props.inheritedCompact, (val, oldVal) => {
			if (val != oldVal && val === localCompact.value)
				localCompact.value = undefined
		})

		function imageFormatClass(article : TweetArticle, index : number) : string {
			const media = article.media[index]
			const size = media.status == MediaLoadStatus.ThumbnailOnly ?
				media.thumbnail.size :
				media.content.size
			if (!size)
				return 'portrait'

			return size.width > size.height ? 'landscape' : 'portrait'
		}

		const showDropdown = ref(false)

		async function fetchLog() {
			console.dir(await service.value.fetchV1Status(article.value.id))
		}

		const timestamp = computed(() => {
			const actualDate = actualArticle.value.creationDate
			const timeSince = Date.now() - actualDate.getTime()
			if (timeSince < 1000)
				return 'just now'
			else if (timeSince < 60000)
				return Math.floor(timeSince / 1000) + 's'
			else if (timeSince < 3600000)
				return Math.floor(timeSince / 60000) + 'm'
			else if (timeSince < 86400000)
				return Math.floor(timeSince / (3600000)) + 'h'
			else if (timeSince < 604800000)
				return Math.floor(timeSince / (86400000)) + 'd'
			else
				return `${monthAbbrevs[actualDate.getMonth()]} ${actualDate.getDate()}`
		})

		return {
			service,
			addUserTimeline,
			TwitterArticleType,
			MediaLoadStatus,
			MediaType,
			actualArticle,
			refArticle,
			compact,
			imageFormatClass,
			showDropdown,
			fetchLog,
			timestamp,
		}
	},
})
</script>

<style scoped lang='sass'>
@use '~@/sass/core' as *

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

.quotedPost
	border: 2px solid $scheme-main-ter
	border-radius: 6px
	padding: 16px

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

	span *
		vertical-align: middle

	p
		white-space: pre-line
</style>