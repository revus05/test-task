import validator from './validator'

const contentValidator = (content: unknown, required = true) =>
	validator<'content'>(content, {
		name: 'content',
		type: 'string',
		required,
		maxLength: 1024,
		notEmpty: true,
	})

export default contentValidator
