<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {UserMentionData} from '../../core/PostData';
import {CreateElement} from 'vue';
import {VNode} from 'vue/types/vnode';

interface ParagraphItem {
	node: VNode,
	indices: [number, number],
}

function textWithIndices(createElement : CreateElement, text : string, startIndex : number) {
	return {
		node: createElement('span', text),
		indices: [startIndex, startIndex + text.length - 1] as [number, number],
	}
}

function userMentionToAnchor(createElement : CreateElement, userMention : UserMentionData) {
	return {
		node: createElement('a', {
				attrs: {
					src: 'https://twitter.com/' + userMention.handle,
				},
				class: 'articleUserMention',
			}, '@' + userMention.handle
		),
		indices: userMention.indices,
	};
}

function prependItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedIndex : number, text : string, item : ParagraphItem) {
	const secondPart = text.substring(item.indices[1] + 1 - paragraph[splicedIndex].indices[0]);

	paragraph.splice(
		splicedIndex, 1,
		item,
		textWithIndices(createElement, secondPart, item.indices[1]),
	);
}

function appendItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedIndex : number, text : string, item : ParagraphItem) {
	const firstPart = text.substring(0, item.indices[0] - paragraph[splicedIndex].indices[0]);

	paragraph.splice(
		splicedIndex, 1,
		textWithIndices(createElement, firstPart, item.indices[0]),
		item,
	);
}

function insertItem(createElement : CreateElement, paragraph : ParagraphItem[], splicedIndex : number, text : string, item : ParagraphItem) {
	const firstPart = text.substring(0, item.indices[0] - paragraph[splicedIndex].indices[0]);
	const secondPart = text.substring(item.indices[1] + 1 - paragraph[splicedIndex].indices[0]);

	paragraph.splice(
		splicedIndex, 1,
		textWithIndices(createElement, firstPart, item.indices[0]),
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

	render(createElement : CreateElement) {
		const paragraph : ParagraphItem[] = [
			textWithIndices(createElement, this.text, 0),
		];

		for (const userMention of this.userMentions) {
			const elIndex = paragraph.findIndex(e => e.indices[0] <= userMention.indices[0] && e.indices[1] >= userMention.indices[1]);

			const el = paragraph[elIndex];
			const text = (el.node.children ? el.node.children[0].text : '') as string;

			if (el.indices[0] === userMention.indices[0] && el.indices[1] === userMention.indices[1]) {
				paragraph.splice(
					elIndex, 1,
					userMentionToAnchor(createElement, userMention),
				);
			}else if (el.indices[0] === userMention.indices[0])
				prependItem(
					createElement, paragraph,
					elIndex, text, userMentionToAnchor(createElement, userMention)
				);
			else if (el.indices[1] === userMention.indices[1])
				appendItem(
					createElement, paragraph,
					elIndex, text, userMentionToAnchor(createElement, userMention)
				);
			else
				insertItem(
					createElement, paragraph,
					elIndex, text, userMentionToAnchor(createElement, userMention)
				);
		}

		return createElement('p', {
			class: 'articleParagraph',
		}, paragraph.map(el => el.node));
	}
}
</script>

<style scoped lang='sass'>

</style>