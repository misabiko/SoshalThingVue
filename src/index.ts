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

class Timeline {
	element : HTMLDivElement;
}

console.log("index is on!");

/*interface PMProps {imageSrcs : string[]}
class PostMedia extends React.Component<PMProps> {
	handleImageLoaded(loadEvent : SyntheticEvent) {
		const img = loadEvent.target as HTMLImageElement;
		if (img.parentElement)
			img.parentElement.classList.add(img.width > img.height ? "landscape" : "portrait");
	}

	render() {
		const imgs = this.props.imageSrcs.map((src : string, i : number) => (
			<div key={i} className={"soshalMediaHolder"}>
				<img onLoad={e => this.handleImageLoaded(e)} alt={"img" + i} src={src}/>
			</div>
		));
		return (
			<div className={"soshalPMedia soshalPMedia" + imgs.length}>
				{imgs}
			</div>
		);
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

function Post(props : {postData: PostData}) {
	return (
		<div className="soshalPost">
			<div className="soshalPSide">
				<img
					alt={props.postData.authorHandle + "'s avatar"}
					src={props.postData.authorAvatar}
				/>
			</div>
			<span>
				{props.postData.authorName}
				{"@" + props.postData.authorHandle}
			</span>
			<p>{props.postData.text}</p>
			{props.postData.images ? <PostMedia imageSrcs={props.postData.images}/> : null}
		</div>
	);
}

interface TProps {
	name: string,
	endpoint: string;
	refreshRate: number;
	options?: any;
}
class Timeline extends React.Component<TProps, {posts : any[]}> {
	private interval?: number;
	protected _options?: any;

	static defaultProps = {refreshRate: 90000};

	constructor(props: Readonly<TProps>) {
		super(props);
		this.state = {
			posts: [] as PostData[]
		};
	}

	get options(): object {
		return {...this.props.options, ...this._options};
	}

	componentDidMount() : void {
		this.resetRefreshing();
		visible(this.resetRefreshing);
	}

	componentWillUnmount() : void {
		window.clearInterval(this.interval);
	}

	resetRefreshing = () => {
		clearInterval(this.interval);
		if (visible()) {
			this.interval = window.setInterval(this.refresh, this.props.refreshRate);

			this.refresh();
		}else
			this.interval = undefined;
	};

	refresh = async () => {
		console.log("Refreshing " + this.props.name);
		const options = this.options;
		await fetch('http://localhost:43043/' + this.props.endpoint + (options ? toURI(options) : ""))
			.then(response => response.json())
			.then(json => {
				console.dir(json);
				const posts : PostData[] = [];
				for (const post of (json instanceof Array ? json : json.statuses))
					posts.push({
						id: post.id_str,
						authorName: post.user.name,
						authorHandle: post.user.screen_name,
						authorAvatar: post.user.profile_image_url_https,
						text: post.text,
						images: (post.extended_entities && post.extended_entities.media.length) ? post.extended_entities.media.map((media : any) => media.media_url_https) : null
					});

				this.setState({posts});
			});
	};

	render() {
		return <div className="soshalTimeline">
			<div className="soshalTHeader" onClick={this.refresh}>{this.props.name}</div>
			<div className="soshalTPosts">{
				this.state.posts.map(
					post => <Post key={post.id} postData={post}/>
				)
			}</div>
		</div>;
	}
}

class HomeTimeline extends React.Component {
	render() {
		//console.dir(this.state.posts);
		//this._options.since_id = this.state.posts[0].id_str;
		return <Timeline endpoint={"statuses/home_timeline"} name={"Home"}/>;
	}
}

function SoshalThing() {
	return (<>
		<HomeTimeline/>
		{/!*<Timeline
			name="Search"
			endpoint={'search/tweets'}
			options={{ q: 'banana since:2011-07-11', count: 10 }}
		/>*!/}
	</>);
}

export default SoshalThing;*/

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