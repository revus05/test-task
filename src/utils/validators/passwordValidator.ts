import validator from './validator'

const passwordValidator = (password: unknown, required = true) =>
	validator<'password'>(password, {
		type: 'string',
		name: 'password',
		required,
		maxLength: 64,
		notEmpty: true,
	})

export default passwordValidator
