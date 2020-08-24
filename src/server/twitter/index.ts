import {ArticleType, PostData, PostImageData, PostVideoData, QuoteData, RepostData} from '../../core/PostData';
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
	const {images, video} = parseEntities(tweet);

	return {
		id: tweet.id_str,
		creationTime: tweet.created_at,
		authorName: tweet.user.name,
		authorHandle: tweet.user.screen_name,
		authorAvatar: tweet.user.profile_image_url_https,
		text: removeTextLink(tweet.full_text),
		images,
		video,
		liked: tweet.favorited,
		reposted: tweet.retweeted,
		likeCount: tweet.favorite_count,
		repostCount: tweet.retweet_count,
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
	};
}

function quoteToQuoteData(tweet : Tweet) : QuoteData {
	if (!tweet.quoted_status)
		throw new Error('Tweet isn\'t a quoted tweet.');

	return {
		id: tweet.id_str,
		creationTime: tweet.created_at,
		reposterName: tweet.user.name,
		reposterHandle: tweet.user.screen_name,
		reposterAvatar: tweet.user.profile_image_url_https,
		repostedId: tweet.quoted_status.id_str,
		text: tweet.full_text,
		liked: tweet.favorited,
		reposted: tweet.retweeted,
		likeCount: tweet.favorite_count,
		repostCount: tweet.retweet_count,
	};
}

function parseEntities(tweet : Tweet) : { images? : PostImageData[], video? : PostVideoData } {
	let images : PostImageData[] | undefined;
	let video : PostVideoData | undefined;

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
			}] :
			undefined;

	return {images, video};
}

export function removeTextLink(text : string) : string {
	const lastIndex = text.lastIndexOf('https://t.co');

	if (lastIndex >= 0)
		return text.substring(0, lastIndex - 1);
	else return text;
}