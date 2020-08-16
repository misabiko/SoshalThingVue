<template lang='pug'>
	.serviceSettings {{ service.name }}
		div(v-for='(rateLimit, endpoint) in rateLimits' :key='endpoint')
			p {{ endpoint }}
			b-progress(:value='rateLimit.remaining' :max='rateLimit.limit' show-value)
				span.has-text-black-bis {{ rateLimit.remaining }} / {{ rateLimit.limit }}
			p Reset {{ toRelative(rateLimit.reset) }}
		.level(v-if='!loggedIn')
			.level-left
			.level-right
				a.button.level-item(:href='service.loginHref') Login
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {State} from 'vuex-class';
import {Logins} from '../store';
import {RateLimitStatus, ServiceStatuses} from '../../core/ServerResponses';
import moment from 'moment';

export interface ServiceData {
	name: string,
	loginHref: string,
	endpoints: string[],
}

@Component
export default class ServiceSettings extends Vue {
	@Prop({type: Object,	required: true})
	readonly service!: ServiceData;

	@State('logins') readonly logins!: Logins;
	@State('services') readonly services!: ServiceStatuses;

	toRelative(time: number) : string {
		return moment.unix(time).fromNow();
	}

	get loggedIn() : boolean {
		return this.logins[this.service.name];
	}

	get rateLimits() : {[endpoint: string] : RateLimitStatus} {
		return this.services[this.service.name] || {};
	}
};
</script>

<style scoped lang='sass'>
@use '../variables' as *
@import '~bulma'

.serviceSettings
	@extend .box
	@extend .has-text-white
	background-color: $element-color
</style>