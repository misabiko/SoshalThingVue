//https://stackoverflow.com/a/19519701/2692695
const visible = (function() {
	let stateKey : string, eventKey : string;
	const keys : { [name : string] : string } = {
		hidden: 'visibilitychange',
		webkitHidden: 'webkitvisibilitychange',
		mozHidden: 'mozvisibilitychange',
		msHidden: 'msvisibilitychange'
	};
	for (stateKey in keys) {
		if (stateKey in document) {
			eventKey = keys[stateKey];
			break;
		}
	}
	return function(c? : EventListenerOrEventListenerObject) {
		if (c) document.addEventListener(eventKey, c);
		return !(document as any)[stateKey];
	}
})();

//https://stackoverflow.com/a/57124645/2692695
//Formats object into RESTful URI parameters (?param1=boop&param2=bap)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toURI(params : { [name : string] : any }) {
	return '?' + Object.entries(params)
		.map(
			([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
		)
		.join('&');
}

function getPostObject(postData : PostData) : Post {
	return (postData as RepostData).reposterName ? new Repost(postData as RepostData) : new Post(postData);
}

class PostMedia {
	element : HTMLDivElement;

	constructor(public imageSrcs : string[]) {
		this.element = document.createElement('div');
		this.element.className = 'soshalPMedia soshalPMedia' + this.imageSrcs.length;

		for (let i = 0; i < this.imageSrcs.length; i++) {
			const mediaHolder = document.createElement('div');
			mediaHolder.className = 'soshalMediaHolder';
			this.element.append(mediaHolder);

			const img = document.createElement('img');
			img.addEventListener('load', PostMedia.handleImageLoaded);
			img.alt = 'img' + i;
			img.src = this.imageSrcs[i];
			mediaHolder.append(img);
		}
	}

	static handleImageLoaded(loadEvent : Event) {
		const img = loadEvent.target as HTMLImageElement;
		if (img.parentElement)
			img.parentElement.classList.add(img.width > img.height ? 'landscape' : 'portrait');
	}
}

interface PostData {
	id : string,
	creationTime : Date,
	authorName : string,
	authorHandle : string,
	authorAvatar : string,
	text : string,
	images? : string[],
	liked : boolean,
	reposted : boolean
}

class Post {
	element : HTMLDivElement;
	postMedia : PostMedia;
	likeButton : HTMLButtonElement;
	repostButton : HTMLButtonElement;
	commentButton : HTMLButtonElement;

	constructor(public data : PostData) {
		this.element = document.createElement('div');
		this.element.className = 'soshalPost';
		this.element.setAttribute('post-id', data.id);

		const sideDiv = document.createElement('div');
		sideDiv.className = 'soshalPSide';
		this.element.append(sideDiv);

		const avatar = document.createElement('img');
		avatar.alt = this.data.authorHandle + '\'s avatar';
		avatar.src = this.data.authorAvatar;
		sideDiv.append(avatar);

		const span = document.createElement('span');
		span.append(this.data.authorName, '@' + this.data.authorHandle);
		this.element.append(span);

		const p = document.createElement('p');
		p.textContent = this.data.text;
		this.element.append(p);

		if (data.images) {
			this.postMedia = new PostMedia(data.images);
			this.element.append(this.postMedia.element);
		}

		const buttons = document.createElement('div');
		buttons.className = 'soshalPButtons';
		buttons.append(
			this.createRepostButton(),
			this.createLikeButton(),
		);
		this.element.append(buttons);
	}

	static createButton(iconName : string, iconStyle : string, className : string, onClick : () => Promise<void>) {
		const button = document.createElement('button');
		button.className = className;
		button.addEventListener('click', onClick);

		const icon = document.createElement('i');
		icon.className = iconStyle + ' fa-' + iconName;
		button.append(icon);

		return button;
	}

	createLikeButton() {
		this.likeButton = Post.createButton('heart', this.data.liked ? 'fas' : 'far', 'likeButton', async () => {
			const twitResp = await fetch('twitter/like/' + this.data.id, {method: 'POST'})
				.then(response => response.json());
			this.setLiked(twitResp.favorited);
		});
		this.setLiked(this.data.liked);

		return this.likeButton;
	}

	setLiked(liked : boolean) {
		if (liked) {
			this.likeButton.classList.add('likedPostButton');
			this.likeButton.firstElementChild.classList.remove('far');
			this.likeButton.firstElementChild.classList.add('fas');
		}else {
			this.likeButton.classList.remove('likedPostButton');
			this.likeButton.firstElementChild.classList.remove('fas');
			this.likeButton.firstElementChild.classList.add('far');
		}
	}

	createRepostButton() {
		this.repostButton = Post.createButton('retweet', 'fas', 'repostButton', async () => {
			const twitResp = await fetch('twitter/retweet/' + this.data.id, {method: 'POST'})
				.then(response => response.json());
			if (twitResp.retweeted)
				this.repostButton.classList.add('repostedPostButton');
		});
		this.setReposted(this.data.reposted);

		return this.repostButton;
	}

	setReposted(liked : boolean) {
		if (liked)
			this.repostButton.classList.add('repostedPostButton');
		else
			this.repostButton.classList.remove('repostedPostButton');
	}
}

interface RepostData extends PostData {
	reposterName : string,
	reposterHandle : string,
	reposterAvatar : string
}

class Repost extends Post {
	constructor(data : RepostData) {
		super(data);

		const repostDiv = document.createElement('div');
		repostDiv.append(data.reposterName + ' retweeted');
		repostDiv.className = 'soshalRepostLabel';
		this.element.prepend(repostDiv);
	}
}

//Remember to clearInterval when removing
class Timeline {
	private interval? : number;
	private posts : Post[] = [];
	element : HTMLDivElement;
	postContainer : HTMLDivElement;

	constructor(readonly name : string, readonly endpoint : string, private options : any = {}, private refreshRate : number = 90000) {
		this.element = document.createElement('div');
		this.element.className = 'soshalTimeline';

		const header = document.createElement('div');
		header.className = 'soshalTHeader';
		header.addEventListener('click', () => this.refresh());
		header.textContent = this.name;
		this.element.append(header);

		this.postContainer = document.createElement('div');
		this.postContainer.className = 'soshalTPosts';
		this.element.append(this.postContainer);

		//Init refreshing and set it as event callback on visible/focus
		this.resetRefreshing();
		visible(() => this.resetRefreshing());
	}

	resetRefreshing() {
		clearInterval(this.interval);
		if (soshalThing.loggedIn && visible()) {
			this.interval = window.setInterval(() => this.refresh(), this.refreshRate);

			this.refresh().then();
		}else
			this.interval = undefined;
	}

	addPost(postData : PostData) {
		const post = getPostObject(postData);
		this.posts.push(post);
		this.postContainer.prepend(post.element);
	}

	insertPost(postData : PostData, index : number) {
		const post = getPostObject(postData);
		this.postContainer.insertBefore(post.element, this.posts[index].element);
		this.posts.splice(index, 0, post);
	}

	async refresh() {
		const newPostDatas = await fetch('/twitter/tweets/' + this.endpoint + (this.options ? toURI(this.options) : ''))
			.then(response => response.json())
			.then(newData => newData.reverse().filter((a : PostData) => this.posts.findIndex(b => b.data.id === a.id) < 0));

		for (const newPostData of newPostDatas) {
			newPostData.creationTime = new Date(newPostData.creationTime);

			let added = false;
			for (let i = 0; i < this.posts.length && !added; i++)
				if (newPostData.creationTime.getTime() < this.posts[i].data.creationTime.getTime()) {
					this.insertPost(newPostData, i);
					added = true;
				}
			if (!added)
				this.addPost(newPostData);
		}
	}
}

class Sidebar {
	element : HTMLDivElement;

	constructor() {
		this.element = document.createElement('div');
		this.element.id = 'soshalSidebar';

		const newTimelineButton = this.newButton('fa-plus');
		newTimelineButton.onclick = () => {
			soshalThing.newTimelineModal.show();
		};
		this.element.append(newTimelineButton);
	}

	newButton(iconName : string) : HTMLButtonElement {
		const button = document.createElement('button');
		button.className = 'button';

		const span = document.createElement('span');
		span.className = 'icon is-small';

		const icon = document.createElement('icon');
		icon.className = 'fas ' + iconName;

		span.append(icon);
		button.append(span);

		return button;
	}
}

class LoginBar {
	element : HTMLDivElement;
	loginLink : HTMLAnchorElement;

	constructor() {
		this.element = document.createElement('div');
		this.element.id = 'soshalLoginBar';

		this.loginLink = document.createElement('a');
		this.element.append(this.loginLink);

		this.setMessage('');
	}

	setMessage(message : string) {
		if (message) {
			this.loginLink.href = message;
			this.loginLink.text = 'Twitter Login';
			this.element.classList.remove('loginBarHidden');
		}else {
			this.loginLink.href = '';
			this.element.classList.add('loginBarHidden');
		}
	}
}

class Modal {
	readonly element = document.createElement('div');
	readonly background = document.createElement('div');
	readonly content = document.createElement('div');
	readonly closeButton = document.createElement('button');

	constructor() {
		this.element.className = 'modal';

		this.background.className = 'modal-background';
		this.background.addEventListener('click', () => {
			this.hide();
		});

		this.content.className = 'modal-content';

		this.closeButton.className = 'modal-close is-large';
		this.closeButton.setAttribute('aria-label', 'close');
		this.closeButton.onclick = () => {
			this.hide();
		};

		this.element.append(this.background, this.content);
	}

	show() {
		this.element.classList.add('is-active');
	}

	hide() {
		this.element.classList.remove('is-active');
	}

	newBox() {
		const box = document.createElement('div');
		box.className = 'box';
		return box;
	}

	newField(...controls : HTMLElement[]) {
		const field = document.createElement('div');
		field.className = 'field';

		field.append(...controls);
		return field;
	}

	newControl(input : HTMLElement) {
		const control = document.createElement('div');
		control.className = 'control';

		control.append(input);
		return control;
	}

	newTextField(fieldName : string, placeholder? : string) {
		const label = document.createElement('label');
		label.className = 'label';
		label.textContent = fieldName;

		const input = document.createElement('input');
		input.className = 'input';
		input.type = 'text';
		input.placeholder = placeholder || fieldName;

		return {
			field: this.newField(label, this.newControl(input)),
			input,
		};
	}

	newSelectField(instruction : string, ...options : string[]) {
		const div = document.createElement('div');
		div.className = 'select';

		const select = document.createElement('select');
		div.append(select);

		const instructionOption = document.createElement('option');
		instructionOption.textContent = instruction;
		instructionOption.disabled = true;
		instructionOption.selected = true;
		instructionOption.hidden = true;
		instructionOption.value = undefined;
		select.append(instructionOption);

		for (const option of options) {
			const el = document.createElement('option');
			el.textContent = option;
			select.append(el);
		}

		return {
			field: this.newField(this.newControl(div)),
			input: select,
		};
	}

	newButtonControl(label : string) {
		const button = document.createElement('button');
		button.className = 'button is-link';
		button.textContent = label;
		button.type = 'button';

		return {
			control: this.newControl(button),
			button,
		};
	}
}

class NewTimelineModal extends Modal {
	constructor() {
		super();

		const box = this.newBox();
		this.content.append(box);

		const {field: nameField, input: nameInput} = this.newTextField('Name');
		box.append(nameField);
		const {field: endpointField, input: endpointSelect} = this.newSelectField('Select an endpoint', 'home_timeline', 'search');
		box.append(endpointField);
		const {field: paramField, input: paramInput} = this.newTextField('Parameters');
		box.append(paramField);

		const {control, button} = this.newButtonControl('Add');
		box.append(control);

		button.onclick = () => {
			soshalThing.addTimeline(new Timeline(
				nameInput.value,
				endpointSelect.options[endpointSelect.selectedIndex].value,
				paramInput.value ? JSON.parse(paramInput.value) : undefined
			));
			endpointSelect.selectedIndex = 0;
			this.hide();
		};
	}
}

class SoshalThing {
	timelines : Timeline[] = [];
	element : HTMLDivElement;
	timelineContainer : HTMLDivElement;
	sidebar = new Sidebar();
	loginBar = new LoginBar();
	loggedIn = false;

	newTimelineModal = new NewTimelineModal();

	constructor() {
		this.element = document.createElement('div');
		this.element.id = 'soshalThing';

		this.timelineContainer = document.createElement('div');
		this.timelineContainer.id = 'soshalTimelineContainer';

		this.element.append(
			this.timelineContainer,
			this.sidebar.element,
			this.loginBar.element,
			this.newTimelineModal.element
		);

		fetch('/twitter/login')
			.then(response => response.json())
			.then(json => {
				if (json.hasOwnProperty('userId'))
					this.setLoggedIn(true);
				else
					this.loginBar.setMessage(json.auth_url);
			});
	}

	addTimeline(timeline : Timeline) {
		this.timelines.push(timeline);
		this.timelineContainer.append(timeline.element);
	}

	setLoggedIn(loggedIn : boolean) {
		this.loggedIn = loggedIn;
		for (const timeline of this.timelines)
			timeline.resetRefreshing();

		if (loggedIn)
			this.timelineContainer.classList.remove('squishedTimelineContainer');
		else
			this.timelineContainer.classList.add('squishedTimelineContainer');
	}
}

const soshalThing = new SoshalThing();
soshalThing.addTimeline(new Timeline('Home', 'home_timeline'));

window.onload = () => document.body.append(soshalThing.element);