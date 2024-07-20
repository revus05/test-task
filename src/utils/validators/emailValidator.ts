import validator from './validator'

const emailValidator = (email: unknown, required = true) =>
	validator<'email'>(email, {
		type: 'string',
		name: 'email',
		required,
		regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
		maxLength: 64,
		notEmpty: true,
	})

export default emailValidator
