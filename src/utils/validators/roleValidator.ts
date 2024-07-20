import validator from './validator'

const roleValidator = (role: unknown, required = true) =>
	validator<'role'>(role, {
		type: 'string',
		name: 'role',
		required,
		match: ['ADMIN', 'USER'],
	})

export default roleValidator
