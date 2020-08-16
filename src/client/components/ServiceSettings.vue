<template lang='pug'>
	.serviceSettings {{ service.name }}
		div(v-for='(rateLimit, endpoint) in rateLimits')
			p {{ endpoint }}
			b-progress(:value='rateLimit.remaining' :max='rateLimit.limit')
				| {{ rateLimit.remaining }} / {{ rateLimit.limit }}
			p Reset: {{ rateLimit.reset }} minutes
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

	get loggedIn() : boolean {
		return this.logins[this.service.name];
	}

	get rateLimits() : {[endpoint: string] : RateLimitStatus} {
		if (this.services.hasOwnProperty(this.service.name)) {
			const limits : { [endpoint : string] : RateLimitStatus } = {};
			for (const [endpoint, status] of Object.entries(this.services[this.service.name]))
				limits[endpoint] = {
					remaining: status.remaining,
					limit: status.limit,
					reset: Math.ceil(((status.reset * 1000) - Date.now()) / 1000 / 60),
				}
			return limits;
		}else
			return {};
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