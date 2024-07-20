import validator from './validator'

const roleValidator = (role: unknown) =>
	validator<'role'>(role, {
		type: 'string',
		name: 'role',
		match: ['ADMIN', 'USER'],
	})

export default roleValidator
