<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import {ExternalLinkData, HashtagData, Indices, PostData, UserMentionData} from '../../core/PostData';
import {CreateElement} from 'vue';
import {VNode} from 'vue/types/vnode';

interface ParagraphItem {
	node : VNode,
	indices : Indices,
}

function textWithIndices(createElement : CreateElement, text : string, startIndex : number, offset = 0) : ParagraphItem {
	return {
		node: createElement('span', text),
		indices: [startIndex, startIndex + text.length - 1 + offset] as Indices,
	};
}

function userMentionToAnchor(createElement : CreateElement, userMention : UserMentionData) : ParagraphItem {
	return {
		node: createElement('a', {
				attrs: {
					href: 'https://twitter.com/' + userMention.handle,
					target: '_blank',
					rel: 'noopener noreferrer',
				},
				class: 'articleUserMention',
			}, '@' + userMention.handle,
		),
		indices: [...userMention.indices] as Indices,
	};
}

function hashtagToAnchor(createElement : CreateElement, hashtag : HashtagData) {
	return {
		node: createElement('a', {
				attrs: {
					href: `https://twitter.com/hashtag/${hashtag.text}?src=hashtag_click`,
					target: '_blank',
					rel: 'noopener noreferrer',
				},
				class: 'articleHashtag',
			}, '#' + hashtag.text,
		),
		indices: [...hashtag.indices] as Indices,
	};
}

function externalLinkToAnchor(createElement : CreateElement, externalLink : ExternalLinkData) {
	return {
		node: createElement('a', {
				attrs: {
					href: externalLink.fullURL,
					target: '_blank',
					rel: 'noopener noreferrer',
				},
				class: 'articleExternalLink',
			}, externalLink.truncatedURL,
		),
		indices: [...externalLink.indices] as Indices,
	};
}

function getExternalLinkIndexOffset(externalLink : ExternalLinkData) {
	//console.log('externalLink: ', externalLink);
	const baseLength = externalLink.indices[1] - externalLink.indices[0] + 1;
	return externalLink.truncatedURL.length - baseLength;
}

function offsetParagraph(paragraph : ParagraphItem[], startIndex : number, indiceOffset : number) {
	for (let i = startIndex + 1; i < paragraph.length; ++i)
		paragraph[i].indices = paragraph[i].indices.map(index => index + indiceOffset) as Indices;
}

function replaceWithItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedEl : ParagraphItem, splicedIndex : number, text : string, item : ParagraphItem, indiceOffset = 0) {
	/*console.log('replace ' + item.indices);
	console.log('text ' + splicedEl.indices);*/

	if (indiceOffset) {
		offsetParagraph(paragraph, splicedIndex, indiceOffset);
		item.indices[1] += indiceOffset;
		//console.log('replace offseted ' + item.indices);
	}

	paragraph.splice(
		splicedIndex, 1,
		item,
	);
}

function prependItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedEl : ParagraphItem, splicedIndex : number, text : string, item : ParagraphItem, indiceOffset = 0) {
	/*console.log('prepend ' + item.indices);
	console.log('text ' + splicedEl.indices);*/

	const secondPart = text.substring(item.indices[1] + 1 - splicedEl.indices[0]);
	//console.log('secondPart: ' + secondPart);

	if (indiceOffset) {
		offsetParagraph(paragraph, splicedIndex, indiceOffset);
		item.indices[1] += indiceOffset;
		//console.log('prepend offseted ' + item.indices);
	}

	paragraph.splice(
		splicedIndex, 1,
		item,
		textWithIndices(createElement, secondPart, item.indices[1] + 1),
	);
}

function appendItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedEl : ParagraphItem, splicedIndex : number, text : string, item : ParagraphItem, indiceOffset = 0) {
	/*console.log('append ' + item.indices);
	console.log('text ' + splicedEl.indices);*/

	const firstPart = text.substring(0, item.indices[0] - splicedEl.indices[0]);
	//console.log('firstPart: ' + firstPart);

	if (indiceOffset) {
		offsetParagraph(paragraph, splicedIndex, indiceOffset);
		item.indices[1] += indiceOffset;
		//console.log('append offseted ' + item.indices);
	}

	paragraph.splice(
		splicedIndex, 1,
		textWithIndices(createElement, firstPart, splicedEl.indices[0]),
		item,
	);
}

function insertItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedEl : ParagraphItem, splicedIndex : number, text : string, item : ParagraphItem, indiceOffset = 0) {
	/*console.log('insert ' + item.indices);
	console.log('text ' + splicedEl.indices);*/

	const firstPart = text.substring(0, item.indices[0] - splicedEl.indices[0]);
	const secondPart = text.substring(item.indices[1] + 1 - splicedEl.indices[0]);
	/*console.log('firstPart: ' + firstPart);
	console.log('secondPart: ' + secondPart);*/

	if (indiceOffset) {
		offsetParagraph(paragraph, splicedIndex, indiceOffset);
		item.indices[1] += indiceOffset;
		//console.log('insert offseted ' + item.indices);
	}

	paragraph.splice(
		splicedIndex, 1,
		textWithIndices(createElement, firstPart, splicedEl.indices[0]),
		item,
		textWithIndices(createElement, secondPart, item.indices[1] + 1),
	);
}

function addItems(createElement : CreateElement, paragraph : ParagraphItem[], items : { indices : Indices }[], renderer : Function, getIndiceOffset? : Function) : number {
	let totalOffset = 0;

	for (const item of items) {
		/*console.log('\nParagraph: ', Array.from(paragraph));
		console.log('Item: ', item);*/

		if (totalOffset)
			item.indices = item.indices.map(index => index + totalOffset) as Indices;

		const elIndex = paragraph.findIndex(e => e.indices[0] <= item.indices[0] && e.indices[1] >= item.indices[1]);

		if (elIndex < 0) {
			console.error('Item: ', item);
			throw new Error('Item doesn\'t fit in the post.');
		}

		const el = paragraph[elIndex];
		const text = (el.node.children ? el.node.children[0].text : '') as string;

		const indiceOffset = getIndiceOffset ? getIndiceOffset(item) : 0;
		totalOffset += indiceOffset;

		if (el.indices[0] === item.indices[0] && el.indices[1] === item.indices[1])
			replaceWithItem(
				createElement, paragraph, el,
				elIndex, text, renderer(createElement, item),
				indiceOffset,
			);
		else if (el.indices[0] === item.indices[0])
			prependItem(
				createElement, paragraph, el,
				elIndex, text, renderer(createElement, item),
				indiceOffset,
			);
		else if (el.indices[1] === item.indices[1])
			appendItem(
				createElement, paragraph, el,
				elIndex, text, renderer(createElement, item),
				indiceOffset,
			);
		else
			insertItem(
				createElement, paragraph, el,
				elIndex, text, renderer(createElement, item),
				indiceOffset,
			);

		/*console.dir(Array.from(paragraph));
		let lastIndex = -1;
		for (const i of paragraph) {
			if (i.indices[0] < lastIndex || i.indices[0] > i.indices[1])
				throw new Error("Paragraph isn't in the right order.");

			lastIndex = i.indices[1];
		}*/
	}

	return totalOffset;
}

function removeItems(createElement : CreateElement, paragraph : ParagraphItem[], items : { indices : Indices }[]) {
	for (const item of items) {
		const elIndex = paragraph.findIndex(e => e.indices[0] <= item.indices[0] && e.indices[1] >= item.indices[1]);

		if (elIndex < 0) {
			console.error('Item: ', item);
			throw new Error('\'Item doesn\'t fit in the post.\'');
		}

		const el = paragraph[elIndex];
		const text = (el.node.children ? el.node.children[0].text : '') as string;

		if (el.indices[0] === item.indices[0] && el.indices[1] === item.indices[1]) {
			paragraph.splice(elIndex, 1);
		}else if (el.indices[0] === item.indices[0])
			paragraph.splice(elIndex, 1, textWithIndices(
				createElement,
				text.substring(item.indices[1] + 1 - el.indices[0]),
				item.indices[1] + 1,
			));
		else if (el.indices[1] === item.indices[1])
			paragraph.splice(elIndex, 1, textWithIndices(
				createElement,
				text.substring(0, item.indices[0] - el.indices[0]),
				el.indices[0],
			));
		else
			paragraph.splice(
				elIndex, 1,
				textWithIndices(
					createElement,
					text.substring(0, item.indices[0] - el.indices[0]),
					el.indices[0],
				),
				textWithIndices(
					createElement,
					text.substring(item.indices[1] + 1 - el.indices[0]),
					item.indices[1] + 1,
				),
			);
	}
}

function cloneProp<T extends { indices : Indices }>(prop : T) : T {
	return {
		...prop,
		indices: [prop.indices[0], prop.indices[1]] as Indices,
	};
}

function clonePropArray<T extends { indices : Indices }>(prop : T[]) : T[] {
	return prop.map(item => cloneProp(item));
}

@Component
export default class ArticleParagraph extends Vue {
	@Prop({type: String, required: true})
	readonly articleId! : string;
	@Prop({type: Object, required: true})
	readonly postData! : PostData;

	render(createElement : CreateElement) {
		const userMentions = this.postData.userMentions ? clonePropArray(this.postData.userMentions) : [];
		const hashtags = this.postData.hashtags ? clonePropArray(this.postData.hashtags) : [];
		const externalLinks = this.postData.externalLinks ? clonePropArray(this.postData.externalLinks) : [];
		const images = this.postData.images ? clonePropArray(this.postData.images) : [];
		const video = this.postData.video ? cloneProp(this.postData.video) : undefined;

		const paragraph = [
			textWithIndices(createElement, this.postData.text, 0),
		];

		try {
			let totalOffset = 0;

			addItems(createElement, paragraph, userMentions, userMentionToAnchor);

			addItems(createElement, paragraph, hashtags, hashtagToAnchor);

			totalOffset += addItems(createElement, paragraph, externalLinks, externalLinkToAnchor, getExternalLinkIndexOffset);

			/*if (paragraph[0].indices[0] !== 0 || paragraph[paragraph.length - 1].indices[1] !== this.postData.text.length - 1) {
				console.error('Paragraph: ');
				console.dir(Array.from(paragraph));
				throw new Error(`Paragraph endings aren't 0 and ${this.postData.text.length - 1}`);
			}*/

			//So far, it looks like twitter media objects all use the same indices (link at the end of tweet)
			if (images.length) {
				if (totalOffset) {
					const item = {
						indices: images[images.length - 1].indices.map((index : number) => index + totalOffset) as Indices,
					};
					removeItems(createElement, paragraph, [item]);
				}else
					removeItems(createElement, paragraph, [{indices: images[images.length - 1].indices}]);
			}

			if (video) {
				//For some reason *some* video indices are 1 index off (see tweet 1298496152560644097)
				/*if (this.video.indices[1] === this.postData.text.length - 2)	//As in, lastIndex + 1
					removeItems(createElement, paragraph, [{indices: [this.video.indices[0], this.video.indices[1] + 1]}]);
				else*/
				if (totalOffset) {
					const item = {
						indices: video.indices.map(index => index + totalOffset) as Indices,
					};
					removeItems(createElement, paragraph, [item]);
				}else
					removeItems(createElement, paragraph, [{indices: video.indices}]);
			}

			//Exaggerated way to "paragraph.trimEnd()"
			if (paragraph.length && paragraph[paragraph.length - 1].node.tag === 'span') {
				const text = (paragraph[paragraph.length - 1].node.children as VNode[])[0].text || '';
				if (text === ' ')
					paragraph.pop();
				else if (!text.endsWith('  ') && text.endsWith(' '))
					(paragraph[paragraph.length - 1].node.children as VNode[])[0].text = text.trimEnd();
			}

			if (totalOffset && externalLinks.length > 1 && externalLinks[externalLinks.length - 1].indices[1] === (this.postData.externalLinks as ExternalLinkData[])[externalLinks.length - 1].indices[1]) {
				/*console.dir(externalLinks);
				console.dir(this.postData.externalLinks);*/
				throw new ReferenceError('Base data was modified by local copy');
			}
		}catch (e) {
			console.error(`Error on ${this.articleId}`);
			console.error('Paragraph: ', paragraph);
			console.error('Text: ', this.postData.text);

			console.error(e);

			return createElement('p', {
				class: 'articleParagraph',
			}, `Error parsing tweet ${this.articleId}\n${this.postData.text}`);
		}

		//console.log('Final paragraph: ', paragraph);

		return createElement('p', {
			class: 'articleParagraph',
		}, paragraph.map(el => el.node));
	}
}
</script>

<style scoped lang='sass'>
p.articleParagraph
	white-space: pre-line
</style>