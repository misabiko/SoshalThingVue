<template lang='pug'>
	.endpointParameters
		b-field(label='User Handle')
			b-input(v-model='handle' required)
		b-field(label='List Slug')
			b-input(v-model='slug' required)
</template>

<script lang='ts'>
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import {TimelineOptions} from '../../../core/Timeline';

@Component
export default class TimelineListOptions extends Vue {
	@Prop({type: Object, required: true})
	readonly options!: TimelineOptions;

	handle : string = this.options.userHandle || '';
	slug : string = this.options.listSlug || '';

	@Watch('handle')
	onHandleChanged(userHandle: string) {
		this.$emit('update:options', {userHandle, listSlug: this.slug});
	}

	@Watch('slug')
	onSlugChanged(listSlug: string) {
		this.$emit('update:options', {listSlug, userHandle: this.handle});
	}

	@Watch('options')
	onOptionsChanged(newOptions: TimelineOptions) {
		this.handle = newOptions.userHandle as string;
		this.slug = newOptions.listSlug as string;
	}
}
</script>