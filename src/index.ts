//https://stackoverflow.com/a/19519701/2692695
const visible = (function(){
	let stateKey:string, eventKey: string;
	const keys: {[name:string]:string} = {
		hidden: "visibilitychange",
		webkitHidden: "webkitvisibilitychange",
		mozHidden: "mozvisibilitychange",
		msHidden: "msvisibilitychange"
	};
	for (stateKey in keys) {
		if (stateKey in document) {
			eventKey = keys[stateKey];
			break;
		}
	}
	return function(c?: EventListenerOrEventListenerObject) {
		if (c) document.addEventListener(eventKey, c);
		return !(document as any)[stateKey];
	}
})();

//https://stackoverflow.com/a/57124645/2692695
//Formats object into RESTful URI parameters (?param1=boop&param2=bap)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toURI(params : {[name: string] : any}) {
	return '?' + Object.entries(params)
		.map(
			([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
		)
		.join("&");
}

function twitterJSONToPostDatas(json : any) : PostData[] {
	console.dir(json);

	return (json instanceof Array ? json : json.statuses).map((postData: any) => {
		if (postData.hasOwnProperty("retweeted_status"))
			return {
				id: postData.id_str,
				authorName: postData.retweeted_status.user.name,
				authorHandle: postData.retweeted_status.user.screen_name,
				authorAvatar: postData.retweeted_status.user.profile_image_url_https,
				text: postData.retweeted_status.text,
				images: (postData.extended_entities && postData.extended_entities.media.length) ? postData.extended_entities.media.map((media : any) => media.media_url_https) : null,
				reposterName: postData.user.name,
				reposterHandle: postData.user.screen_name,
				reposterAvatar: postData.user.profile_image_url_https
			};

		return {
			id: postData.id_str,
			authorName: postData.user.name,
			authorHandle: postData.user.screen_name,
			authorAvatar: postData.user.profile_image_url_https,
			text: postData.text,
			images: (postData.extended_entities && postData.extended_entities.media.length) ? postData.extended_entities.media.map((media : any) => media.media_url_https) : null
		};
	});
}

class PostMedia {
	element : HTMLDivElement;

	constructor(public imageSrcs : string[]) {
		this.element = document.createElement("div");
		this.element.className = "soshalPMedia soshalPMedia" + this.imageSrcs.length;


		for (let i = 0; i < this.imageSrcs.length; i++) {
			const mediaHolder = document.createElement("div");
			mediaHolder.className = "soshalMediaHolder";
			this.element.append(mediaHolder);

			const img = document.createElement("img");
			img.addEventListener("load", PostMedia.handleImageLoaded);
			img.alt = "img" + i;
			img.src = this.imageSrcs[i];
			mediaHolder.append(img);
		}
	}

	static handleImageLoaded(loadEvent : Event) {
		const img = loadEvent.target as HTMLImageElement;
		if (img.parentElement)
			img.parentElement.classList.add(img.width > img.height ? "landscape" : "portrait");
	}
}

interface PostData {
	id : string,
	authorName : string,
	authorHandle : string,
	authorAvatar : string,
	text : string,
	images? : string[]
}

class Post {
	element : HTMLDivElement;
	postMedia : PostMedia;

	constructor(public data : PostData) {
		this.element = document.createElement("div");
		this.element.className = "soshalPost";

		const sideDiv = document.createElement("div");
		sideDiv.className = "soshalPSide";
		this.element.append(sideDiv);

		const avatar = document.createElement("img");
		avatar.alt = this.data.authorHandle + "'s avatar";
		avatar.src = this.data.authorAvatar;
		sideDiv.append(avatar);

		const span = document.createElement("span");
		span.append(this.data.authorName, "@" + this.data.authorHandle);
		this.element.append(span);

		const p = document.createElement("p");
		p.textContent = this.data.text;
		this.element.append(p);

		if (data.images) {
			this.postMedia = new PostMedia(data.images);
			this.element.append(this.postMedia.element);
		}
	}
}

interface RepostData extends PostData {
	reposterName : string,
	reposterHandle : string,
	reposterAvatar : string
}

class Repost extends Post {
	constructor(data : RepostData) {
		super(data);

		const repostDiv = document.createElement("div");
		repostDiv.append(data.reposterName + " retweeted");
		repostDiv.className = "soshalRepostLabel";
		this.element.prepend(repostDiv);
	}
}

//Remember to clearInterval when removing
class Timeline {
	private interval?: number;
	private posts : Post[] = [];
	element : HTMLDivElement;
	postContainer : HTMLDivElement;

	constructor(readonly name : string, readonly endpoint : string, private options : any = {}, private refreshRate : number = 90000) {
		this.element = document.createElement("div");
		this.element.className = "soshalTimeline";

		const header = document.createElement("div");
		header.className = "soshalTHeader";
		header.addEventListener("click", () => this.refresh());
		header.textContent = this.name;
		this.element.append(header);

		this.postContainer = document.createElement("div");
		this.postContainer.className = "soshalTPosts";
		this.element.append(this.postContainer);

		this.resetRefreshing();
		visible(this.resetRefreshing);
	}

	resetRefreshing() {
		clearInterval(this.interval);
		if (visible()) {
			this.interval = window.setInterval(() => this.refresh(), this.refreshRate);

			this.refresh().then();
		}else
			this.interval = undefined;
	}

	async refresh() {
		console.log("Refreshing " + this.name);
		const newPostDatas = await fetch('http://localhost:43043/' + this.endpoint + (this.options ? toURI(this.options) : ""))
			.then(response => response.json())
			.then(json => twitterJSONToPostDatas(json));

		for (const postData of newPostDatas.reverse()) {
			const post = (postData as RepostData).reposterName ? new Repost(postData as RepostData) : new Post(postData);
			this.posts.unshift(post);
			this.postContainer.prepend(post.element);
		}

		this.options.since_id = this.posts[0].data.id;
	}
}

class SoshalThing {
	timelines : Timeline[] = [];
	element : HTMLDivElement;

	constructor() {
		this.element = document.createElement("div");
		this.element.id = "soshalThing";
	}

	addTimeline(timeline : Timeline) {
		this.timelines.push(timeline);
		this.element.append(timeline.element);
	}
}

const soshalThing = new SoshalThing();
soshalThing.addTimeline(new Timeline("Home", "statuses/home_timeline"));
soshalThing.addTimeline(new Timeline("Art", "search/tweets", {"q": "list:misabiko/Art filter:media -filter:retweets"}, 10000));

window.onload = () => document.body.append(soshalThing.element);

/*
contributors: null
coordinates: null
created_at: "Fri Jul 26 10:41:53 +0000 2019"
entities: {hashtags: Array(0), symbols: Array(0), user_mentions: Array(0), urls: Array(0)}
favorite_count: 0
favorited: false
geo: null
id: 1154703380016615400
id_str: "1154703380016615424"
in_reply_to_screen_name: null
in_reply_to_status_id: null
in_reply_to_status_id_str: null
in_reply_to_user_id: null
in_reply_to_user_id_str: null
is_quote_status: false
lang: "ja"
place: null
retweet_count: 0
retweeted: false
source: "<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>"
text: "花火の音が聞こえる"
truncated: false
user:
	contributors_enabled: false
	created_at: "Mon Apr 22 10:45:39 +0000 2013"
	default_profile: false
	default_profile_image: false
	description: "のんびりだらだらお絵描きマン like:スプラトゥーン A&C/ポケモン/東方/ アイコン→【@sakibuizu2】"
	entities: {url: {…}, description: {…}}
	favourites_count: 3800
	follow_request_sent: false
	followers_count: 479
	following: true
	friends_count: 348
	geo_enabled: false
	has_extended_profile: true
	id: 1371833978
	id_str: "1371833978"
	is_translation_enabled: false
	is_translator: false
	lang: null
	listed_count: 29
	location: "やけたとう"
	name: "かまち＠絆"
	notifications: false
	profile_background_color: "9AE4E8"
	profile_background_image_url: "http://abs.twimg.com/images/themes/theme16/bg.gif"
	profile_background_image_url_https: "https://abs.twimg.com/images/themes/theme16/bg.gif"
	profile_background_tile: false
	profile_banner_url: "https://pbs.twimg.com/profile_banners/1371833978/1555606290"
	profile_image_url: "http://pbs.twimg.com/profile_images/1001402893927268352/K4FU-liF_normal.jpg"
	profile_image_url_https: "https://pbs.twimg.com/profile_images/1001402893927268352/K4FU-liF_normal.jpg"
	profile_link_color: "0084B4"
	profile_sidebar_border_color: "BDDCAD"
	profile_sidebar_fill_color: "DDFFCC"
	profile_text_color: "333333"
	profile_use_background_image: true
	protected: false
	screen_name: "kamati0maru"
	statuses_count: 31373
	time_zone: null
	translator_type: "none"
	url: "https://t.co/QmgE8EaHm5"
	utc_offset: null
	verified: false
	__proto__: Object
	__proto__: Object
*/