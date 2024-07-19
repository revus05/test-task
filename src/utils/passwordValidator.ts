import validator from './validator'

const passwordValidator = (password: unknown) =>
	validator<'password'>(password, {
		type: 'string',
		name: 'password',
		maxLength: 64,
		notEmpty: true,
	})

export default passwordValidator
