import React from 'react';

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

let statuses = [] as any[];
let homePromise : Promise<void> = fetch('http://localhost:43043/statuses/home_timeline')
	.then(response => response.json())
	.then(json => {
		console.dir(json);
		statuses = json;
	});

function PostMedia(props : {imageSrcs : string[]}) {
	const imgs = props.imageSrcs.map((src : string, i : number) => <img key={i} alt={"img" + i} src={src}/>);
	return (
		<div className="soshalPMedia">
			{imgs}
		</div>
	);
}

interface PostData {
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

interface TimelineState {
	statuses : any[]
}
class Timeline extends React.Component<{}, TimelineState> {
	constructor(props: TimelineState) {
		super(props);
		this.state = {
			statuses: [] as PostData[]
		};
	}

	componentDidMount() : void {
		homePromise.then(() => this.setState({statuses}));
	}

	render() {
		const posts = [] as JSX.Element[];
		for (let status of this.state.statuses)
			posts.push(<Post key={status.id} postData={{
				authorName: status.user.name,
				authorHandle: status.user.screen_name,
				authorAvatar: status.user.profile_image_url_https,
				text: status.text,
				images: (status.extended_entities && status.extended_entities.media.length) ? status.extended_entities.media.map((media : any) => media.media_url_https) : null
			}}/>);

		return <div className="soshalTimeline">
			<div className="soshalTHeader">Home</div>
			<div className="soshalTPosts">{posts}</div>
		</div>;
	}
}

export default Timeline;

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