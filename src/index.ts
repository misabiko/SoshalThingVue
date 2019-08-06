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