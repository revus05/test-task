type Options<Name> = {
	name: Name
	type: 'string'
	required?: boolean
	match?: number[] | string[]
	notEmpty?: boolean
	minLength?: number
	maxLength?: number
	regExp?: RegExp
}

export type ValidatorErrors<Name extends string> =
	| `Wrong ${Name} type`
	| `Wrong ${Name} value`
	| `Empty ${Name}`
	| `Maximum ${Name} length is ${number} characters`
	| `Minimum ${Name} length is ${number} characters`
	| `Wrong ${Name} format`
	| `No ${Name} provided`

const validator = <Name extends string>(value: unknown, options: Options<Name>): ValidatorErrors<Name> | null => {
	if (!options.required && typeof value === 'undefined') {
		return null
	}
	if (options.required && typeof value === 'undefined') {
		return `No ${options.name} provided`
	}
	if (typeof value !== options.type) {
		return `Wrong ${options.name} type`
	}
	if (options.match && !options.match.find(option => option === value)) {
		return `Wrong ${options.name} value`
	}
	if (options.notEmpty && !value) {
		return `Empty ${options.name}`
	}
	if (options.maxLength && String(value).length > options.maxLength) {
		return `Maximum ${options.name} length is ${options.maxLength} characters`
	}
	if (options.minLength && String(value).length < options.minLength) {
		return `Minimum ${options.name} length is ${options.minLength} characters`
	}
	if (options.regExp && !options.regExp.test(String(value))) {
		return `Wrong ${options.name} format`
	}
	return null
}

export default validator
