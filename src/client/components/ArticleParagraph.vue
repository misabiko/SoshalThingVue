<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {HashtagData, Indices, UserMentionData} from '../../core/PostData';
import {CreateElement} from 'vue';
import {VNode} from 'vue/types/vnode';

interface ParagraphItem {
	node: VNode,
	indices: Indices,
}

function textWithIndices(createElement : CreateElement, text : string, startIndex : number) {
	return {
		node: createElement('span', text),
		indices: [startIndex, startIndex + text.length - 1] as Indices,
	}
}

function userMentionToAnchor(createElement : CreateElement, userMention : UserMentionData) {
	return {
		node: createElement('a', {
				attrs: {
					href: 'https://twitter.com/' + userMention.handle,
					target: '_blank',
					rel: 'noopener noreferrer',
				},
				class: 'articleUserMention',
			}, '@' + userMention.handle
		),
		indices: userMention.indices,
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
			class: 'articleUserMention',
		}, '#' + hashtag.text
		),
		indices: hashtag.indices,
	};
}

function prependItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedEl : ParagraphItem, splicedIndex : number, text : string, item : ParagraphItem) {
	/*console.log(`prepend ${item.indices}`);
	console.log(`text ${splicedEl.indices}`);*/
	const secondPart = text.substring(item.indices[1] + 1 - paragraph[splicedIndex].indices[0]);

	paragraph.splice(
		splicedIndex, 1,
		item,
		textWithIndices(createElement, secondPart, item.indices[1] + 1),
	);
}

function appendItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedEl : ParagraphItem, splicedIndex : number, text : string, item : ParagraphItem) {
	/*console.log(`append ${item.indices}`);
	console.log(`text ${splicedEl.indices}`);*/
	const firstPart = text.substring(0, item.indices[0] - splicedEl.indices[0]);

	paragraph.splice(
		splicedIndex, 1,
		textWithIndices(createElement, firstPart, splicedEl.indices[0]),
		item,
	);
}

function insertItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedEl : ParagraphItem, splicedIndex : number, text : string, item : ParagraphItem) {
	/*console.log(`insert ${item.indices}`);
	console.log(`text ${splicedEl.indices}`);*/
	const firstPart = text.substring(0, item.indices[0] - splicedEl.indices[0]);
	const secondPart = text.substring(item.indices[1] + 1 - splicedEl.indices[0]);

	paragraph.splice(
		splicedIndex, 1,
		textWithIndices(createElement, firstPart, splicedEl.indices[0]),
		item,
		textWithIndices(createElement, secondPart, item.indices[1] + 1),
	);
}

@Component
export default class ArticleParagraph extends Vue {
	@Prop({type: String, required: true})
	readonly text! : string;
	@Prop({type: Array, default: () => []})
	readonly userMentions! : UserMentionData[];
	@Prop({type: Array, default: () => []})
	readonly hashtags! : HashtagData[];

	render(createElement : CreateElement) {
		const paragraph : ParagraphItem[] = [
			textWithIndices(createElement, this.text, 0),
		];

		for (const userMention of this.userMentions) {
			const elIndex = paragraph.findIndex(e => e.indices[0] <= userMention.indices[0] && e.indices[1] >= userMention.indices[1]);

			if (elIndex < 0)
				throw new Error(`${userMention} doesn't fit in the post.`);

			const el = paragraph[elIndex];
			const text = (el.node.children ? el.node.children[0].text : '') as string;

			if (el.indices[0] === userMention.indices[0] && el.indices[1] === userMention.indices[1]) {
				paragraph.splice(
					elIndex, 1,
					userMentionToAnchor(createElement, userMention),
				);
			}else if (el.indices[0] === userMention.indices[0])
				prependItem(
					createElement, paragraph, el,
					elIndex, text, userMentionToAnchor(createElement, userMention)
				);
			else if (el.indices[1] === userMention.indices[1])
				appendItem(
					createElement, paragraph, el,
					elIndex, text, userMentionToAnchor(createElement, userMention)
				);
			else
				insertItem(
					createElement, paragraph, el,
					elIndex, text, userMentionToAnchor(createElement, userMention)
				);

			/*console.dir(Array.from(paragraph));
			let lastIndex = -1;
			for (const item of paragraph) {
				if (item.indices[0] < lastIndex || item.indices[0] > item.indices[1])
					throw new Error("Paragraph isn't in the right order.");

				lastIndex = item.indices[1];
			}*/
		}

		for (const hashtag of this.hashtags) {
			const elIndex = paragraph.findIndex(e => e.indices[0] <= hashtag.indices[0] && e.indices[1] >= hashtag.indices[1]);

			if (elIndex < 0)
				throw new Error(`${hashtag} doesn't fit in the post.`);

			const el = paragraph[elIndex];
			const text = (el.node.children ? el.node.children[0].text : '') as string;

			if (el.indices[0] === hashtag.indices[0] && el.indices[1] === hashtag.indices[1]) {
				paragraph.splice(
					elIndex, 1,
					hashtagToAnchor(createElement, hashtag),
				);
			}else if (el.indices[0] === hashtag.indices[0])
				prependItem(
					createElement, paragraph, el,
					elIndex, text, hashtagToAnchor(createElement, hashtag)
				);
			else if (el.indices[1] === hashtag.indices[1])
				appendItem(
					createElement, paragraph, el,
					elIndex, text, hashtagToAnchor(createElement, hashtag)
				);
			else
				insertItem(
					createElement, paragraph, el,
					elIndex, text, hashtagToAnchor(createElement, hashtag)
				);

			/*console.dir(Array.from(paragraph));
			let lastIndex = -1;
			for (const item of paragraph) {
				if (item.indices[0] < lastIndex || item.indices[0] > item.indices[1])
					throw new Error("Paragraph isn't in the right order.");

				lastIndex = item.indices[1];
			}*/
		}

		if (paragraph[0].indices[0] !== 0 || paragraph[paragraph.length - 1].indices[1] !== this.text.length - 1)
			throw new Error(`Paragraph endings aren't 0 and ${this.text.length - 1}`);

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