import {Indices} from '../../core/PostData';

export interface TwitterResponse {
	_headers : TwitterHeaders;
}

export interface TwitterHomeTimeline extends TwitterResponse {
	[index : number] : Tweet;
}

export interface TwitterSearchResponse extends TwitterResponse {
	statuses : Tweet[];
	search_metadata : {
		completed_in : number;
		max_id : number;
		max_id_str : string;
		next_results : string;
		query : string;
		refresh_url : string;
		count : number;
		since_id : number;
		since_id_str : string;
	}
}

export interface TwitterHeaders extends Headers {
	'cache-control' : [];
	connection : [];
	'content-disposition' : [];
	'content-encoding' : [];
	'content-length' : [];
	'content-type' : [];
	date : [];
	expires : [];
	'last-modified' : [];
	pragma : [];
	server : [];
	'set-cookie' : [];
	status : [];
	'strict-transport-security' : [];
	'x-access-level' : [];
	'x-connection-hash' : [];
	'x-content-type-options' : [];
	'x-frame-options' : [];
	'x-rate-limit-limit' : [];
	'x-rate-limit-remaining' : [];
	'x-rate-limit-reset' : [];
	'x-response-time' : [];
	'x-transaction' : [];
	'x-twitter-response-tags' : [];
	'x-xss-protection' : [];
}

export interface Tweet {
	created_at : string;
	id : number;
	id_str : string;
	//text : string;
	full_text : string;
	source : string;
	truncated : boolean;
	in_reply_to_status_id : number;
	in_reply_to_status_id_str : string;
	in_reply_to_user_id : number;
	in_reply_to_user_id_str : string;
	in_reply_to_screen_name : string;
	user : User;
	coordinates : Coordinates;
	place : Place;
	quoted_status_id : number;
	quoted_status_id_str : string;
	is_quote_status : boolean;
	quoted_status? : Tweet;
	retweeted_status? : Tweet;
	quote_count? : number;
	reply_count : number;
	retweet_count : number;
	favorite_count : number;
	entities : Entities;
	extended_entities? : Entities;
	geo : null;
	contributors : null;
	favorited : boolean;
	retweeted : boolean;
	possibly_sensitive? : boolean;
	possibly_sensitive_appealable? : boolean;
	lang : string;
}

export interface User {
	id : number;
	id_str : string;
	name : string;
	screen_name : string;
	location : string;
	description : string;
	url : string;
	entities : {
		url : {
			urls : TweetURL[];
		}
		description : {
			urls : TweetURL[];
		}
	}
	protected : boolean;
	followers_count : number;
	friends_count : number;
	listed_count : number;
	created_at : string;
	favourites_count : number;
	//utc_offset: null;
	//time_zone: null;
	geo_enabled : boolean;
	verified : boolean;
	statuses_count : number;
	//lang: null;
	contributors_enabled : boolean;
	is_translator : boolean;
	is_translation_enabled : boolean;
	profile_background_color : string;
	profile_background_image_url : string;
	profile_background_image_url_https : string;
	profile_background_tile : boolean;
	profile_image_url : string;
	profile_image_url_https : string;
	profile_banner_url : string;
	profile_link_color : string;
	profile_sidebar_border_color : string;
	profile_sidebar_fill_color : string;
	profile_text_color : string;
	profile_use_background_image : boolean;
	has_extended_profile : boolean;
	default_profile : boolean;
	default_profile_image : boolean;
	following : boolean;
	follow_request_sent : boolean;
	notifications : boolean;
	translator_type : string;
}

export interface Coordinates {
	geo : {
		type : string;
		coordinates : number[];
	}
	coordinates : {
		type : string;
		coordinates : number[];
	}
	place : Place;
}

export interface Place {
	id : string;
	url : string;
	place_type : string;
	name : string;
	fulle_name : string;
	country_code : string;
	country : string;
	bounding_box : {
		coordinates : number[][][];
		type : string;
	}
	attributes : object;
}

export interface Entities {
	hashtags : Hashtag[];
	symbols : [];
	user_mentions : UserMention[];
	urls : TweetURL[];
	media? : Media[];
}

export interface Hashtag {
	indices : Indices;
	text : string;
}

export interface Media {
	display_url : string;
	expanded_url : string;
	id : number;
	id_str : string;
	indices : Indices;
	media_url : string;
	media_url_https : string;
	sizes : {
		thumb : MediaSize;
		large : MediaSize;
		medium : MediaSize;
		small : MediaSize;
	}
	source_status_id : number;
	source_status_id_str : string;
	type : string;
	url : string;
	source_user_id : number;
	source_user_id_str : string;
	video_info? : {
		aspect_ratio : number[];
		duration_millis? : number;
		variants : {
			bitrate? : number;
			content_type : string;
			url : string;
		}[]
	}
	additional_media_info? : {
		title : string
		description : string
		embeddable : boolean
		monetizable : boolean
	}
}

export interface MediaSize {
	w : number
	h : number
	resize : string
}

export interface TweetURL {
	display_url : string;
	expanded_url : string;
	indices : Indices;
	url : string;
}

export interface UserMention {
	id : number;
	id_str : string;
	indices : Indices;
	name : string;
	screen_name : string;
}

export interface Symbol {
	indices : Indices;
	text : string;
}

export interface Poll {
	options : {
		position : number;
		text : string;
	}[]
	end_datetime : string;
	duration_minutes : string;
}