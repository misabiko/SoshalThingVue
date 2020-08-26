import {
	ArticleType,
	HashtagData,
	PostData,
	PostImageData,
	PostVideoData,
	QuoteData,
	RepostData,
	UserMentionData,
} from '../../core/PostData';
import {TimelinePayload} from '../../core/ServerResponses';
import {Media, Tweet} from './types';

export function parseTweets(tweets : Tweet[]) : { posts : PostData[], reposts : RepostData[], quotes : QuoteData[], timelinePosts : TimelinePayload } {
	const posts : PostData[] = [];
	const reposts : RepostData[] = [];
	const quotes : QuoteData[] = [];
	const timelinePosts : TimelinePayload = {newArticles: []};

	tweets.reverse().map(tweet => {
		const {post, repost, quote} = parseTweet(tweet);
		if (!posts.some(p => p.id === post.id))
			posts.push(post);

		if (repost) {
			reposts.push(repost);
			timelinePosts.newArticles.push({type: ArticleType.Repost, id: repost.id});
		}else if (quote) {
			quotes.push(quote);
			timelinePosts.newArticles.push({type: ArticleType.Quote, id: quote.id});
		}else
			timelinePosts.newArticles.push({type: ArticleType.Post, id: post.id});
	});

	return {posts, reposts, quotes, timelinePosts};
}

export function parseTweet(tweet : Tweet) : { post : PostData, repost? : RepostData, quote? : QuoteData } {
	if (tweet.retweeted_status)
		return {
			post: tweetToPostData(tweet.retweeted_status),
			repost: retweetToRepostData(tweet),
		};
	else if (tweet.quoted_status)
		return {
			post: tweetToPostData(tweet.quoted_status),
			quote: quoteToQuoteData(tweet),
		};
	else
		return {
			post: tweetToPostData(tweet),
		};
}

export function tweetToPostData(tweet : Tweet) : PostData {
	const {images, video, userMentions, hashtags} = parseEntities(tweet);

	return {
		id: tweet.id_str,
		creationTime: tweet.created_at,
		authorName: tweet.user.name,
		authorHandle: tweet.user.screen_name,
		authorAvatar: tweet.user.profile_image_url_https,
		text: tweet.full_text,
		images,
		video,
		liked: tweet.favorited,
		reposted: tweet.retweeted,
		likeCount: tweet.favorite_count,
		repostCount: tweet.retweet_count,
		userMentions,
		hashtags,
		rawObject: tweet,
	};
}

function retweetToRepostData(tweet : Tweet) : RepostData {
	if (!tweet.retweeted_status)
		throw new Error('Tweet doesn\'t include retweeted_status.');

	return {
		id: tweet.id_str,
		creationTime: tweet.created_at,
		reposterName: tweet.user.name,
		reposterHandle: tweet.user.screen_name,
		reposterAvatar: tweet.user.profile_image_url_https,
		repostedId: tweet.retweeted_status.id_str,
		rawObject: tweet,
	};
}

function quoteToQuoteData(tweet : Tweet) : QuoteData {
	if (!tweet.quoted_status)
		throw new Error('Tweet isn\'t a quoted tweet.');

	return {
		id: tweet.id_str,
		creationTime: tweet.created_at,
		authorName: tweet.user.name,
		authorHandle: tweet.user.screen_name,
		authorAvatar: tweet.user.profile_image_url_https,
		text: tweet.full_text,
		liked: tweet.favorited,
		reposted: tweet.retweeted,
		likeCount: tweet.favorite_count,
		repostCount: tweet.retweet_count,
		quotedId: tweet.quoted_status.id_str,
		rawObject: tweet,
	};
}

function parseEntities(tweet : Tweet) : { images? : PostImageData[], video? : PostVideoData, userMentions? : UserMentionData[], hashtags? : HashtagData[] } {
	let images : PostImageData[] | undefined;
	let video : PostVideoData | undefined;
	let userMentions : UserMentionData[] | undefined;
	let hashtags : HashtagData[] | undefined;

	if (tweet.extended_entities) {
		const medias = tweet.extended_entities.media;

		if (medias) {
			const media = medias[0];

			switch (media.type) {
				case 'photo':
					images = medias.map((media : Media) => {
						return {
							url: media.media_url_https,
							sizes: media.sizes,
							indices: [media.indices[0], media.indices[1] - 1],
						};
					});
					break;
				case 'video':
					if (media.video_info && media.video_info.variants) {
						video = {
							type: 'video',
							url: media.media_url_https,
							sizes: media.sizes,
							aspectRatio: media.video_info.aspect_ratio,
							durationMillis: media.video_info.duration_millis,
							variants: media.video_info.variants.map(variant => {
								return {
									url: variant.url,
									contentType: variant.content_type,
									bitrate: variant.bitrate as number,
								};
							}),
							autoplay: false,
							indices: [media.indices[0], media.indices[1] - 1],
						};
					}
					break;
				case 'animated_gif':
					if (media.video_info && media.video_info.variants) {
						video = {
							type: 'gif',
							url: media.media_url_https,
							sizes: media.sizes,
							aspectRatio: media.video_info.aspect_ratio,
							variants: media.video_info.variants.map(variant => {
								return {
									url: variant.url,
									contentType: variant.content_type,
									bitrate: variant.bitrate as number,
								};
							}),
							autoplay: true,
							indices: [media.indices[0], media.indices[1] - 1],
						};
					}
					break;
			}
		}
	}else
		images = tweet.entities && tweet.entities.media ?
			[{
				url: tweet.entities.media[0].media_url_https,
				sizes: tweet.entities.media[0].sizes,
				indices: [tweet.entities.media[0].indices[0], tweet.entities.media[0].indices[1] - 1],
			}] :
			undefined;

	userMentions = tweet.entities.user_mentions.map(user_mention => ({
		id: user_mention.id_str,
		handle: user_mention.screen_name,
		name: user_mention.name,
		indices: [user_mention.indices[0], user_mention.indices[1] - 1],
	}));

	hashtags = tweet.entities.hashtags.map(hashtag => ({
		text: hashtag.text,
		indices: [hashtag.indices[0], hashtag.indices[1] - 1],
	}));

	return {images, video, userMentions, hashtags};
}

//TODO Remove the removeTextLink func
export function removeTextLink(text : string) : string {
	const lastIndex = text.lastIndexOf('https://t.co');

	if (lastIndex >= 0)
		return text.substring(0, lastIndex - 1);
	else return text;
}