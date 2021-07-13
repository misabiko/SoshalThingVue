import {h, Ref, ref} from 'vue'

export function useAutoScroll(containerEl : Ref) {
	const scrollDirection = ref(false)
	const scrollSpeed = ref(3)
	const scrollRequestId = ref<number | undefined>(undefined)

	function autoScroll(scrollUp? : boolean) {
		scrollDirection.value = scrollUp === undefined ? !scrollDirection.value : scrollUp
		stopScroll()

		const scrollStep = () => {
			if ((scrollDirection.value && containerEl.value.$refs.root.scrollTop > 0) ||
				(!scrollDirection.value && containerEl.value.$refs.root.scrollTop < containerEl.value.$refs.root.scrollHeight - containerEl.value.$refs.root.clientHeight))
				containerEl.value.$refs.root.scrollBy(0, scrollDirection.value ? -scrollSpeed.value : scrollSpeed.value)
			else
				scrollDirection.value = !scrollDirection.value
			scrollRequestId.value = window.requestAnimationFrame(scrollStep)
		}
		scrollRequestId.value = window.requestAnimationFrame(scrollStep)

		window.addEventListener('mousedown', stopScroll, {once: true})
	}

	function stopScroll() {
		if (scrollRequestId.value === undefined)
			return

		window.cancelAnimationFrame(scrollRequestId.value)
		scrollRequestId.value = undefined
	}

	const scrollOptions = () => h('div', {class: 'field'}, [
		h('label', {class: 'label'}, 'Auto Scroll'),
		h('div', {class: 'control'},
			h('input', {
				class: 'input',
				type: 'number',
				value: scrollSpeed.value,
				min: 1,
				onChange: (e: InputEvent) => scrollSpeed.value = parseInt((e.target as HTMLInputElement).value),
			})
		)
	])

	return {autoScroll, scrollOptions}
}