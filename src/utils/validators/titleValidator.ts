import validator from './validator'

const titleValidator = (title: unknown, required = true) =>
	validator<'title'>(title, {
		name: 'title',
		type: 'string',
		required,
		maxLength: 128,
		notEmpty: true,
	})

export default titleValidator
