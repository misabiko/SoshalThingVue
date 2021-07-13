(globalThis as any).localStorage = {
	getItem(arg : any) {
		return undefined
	},

	setItem(arg : any) {},
}