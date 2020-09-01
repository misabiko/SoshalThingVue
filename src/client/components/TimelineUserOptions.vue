<template lang='pug'>
	b-field(label='User Handle')
		b-input(v-model='handle' required)
</template>

<script lang='ts'>
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import {TimelineOptions} from '../../core/Timeline';

@Component
export default class TimelineUserOptions extends Vue {
	@Prop({type: Object, required: true})
	readonly options!: TimelineOptions;

	handle : string = this.options.userHandle || '';

	@Watch('handle')
	onHandleChanged(userHandle: string) {
		this.$emit('update:options', {userHandle});
	}

	@Watch('options')
	onOptionsChanged(newOptions: TimelineOptions) {
		this.handle = newOptions.userHandle as string;
	}
}
</script>