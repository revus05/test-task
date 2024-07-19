import validator from './validator'

const emailValidator = (email: unknown) =>
	validator<'email'>(email, {
		type: 'string',
		name: 'email',
		regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
		maxLength: 64,
		notEmpty: true,
	})

export default emailValidator
