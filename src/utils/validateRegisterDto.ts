import { $Enums } from '@prisma/client'
import getErrorMessage from './getErrorMessage'
import getSuccessMessage from './getSuccessMessage'
import { RegisterData, RegisterDto } from '../auth/register/register.service'
import validator, { ValidatorErrors } from './validator'

export type DtoValidationErrors = ValidatorErrors<'email' | 'password' | 'role'>

const validateRegisterDto = (registerDto: RegisterDto) => {
	const result: Partial<RegisterData> = {}
	const errors: DtoValidationErrors[] = []

	const emailValidationError = validator<'email'>(registerDto.email, {
		type: 'string',
		name: 'email',
		regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
		maxLength: 64,
		notEmpty: true,
	})
	if (emailValidationError) {
		errors.push(emailValidationError)
	} else {
		result.email = registerDto.email as string
	}

	const passwordValidationError = validator<'password'>(registerDto.password, {
		type: 'string',
		name: 'password',
		maxLength: 64,
		notEmpty: true,
	})
	if (passwordValidationError) {
		errors.push(passwordValidationError)
	} else {
		result.password = registerDto.password as string
	}

	const roleValidationError = validator<'role'>(registerDto.role, {
		type: 'string',
		name: 'role',
		match: ['ADMIN', 'USER'],
	})
	if (roleValidationError) {
		errors.push(roleValidationError)
	} else {
		result.role = registerDto.role as $Enums.Role
	}

	if (errors.length) {
		return getErrorMessage<DtoValidationErrors[]>(errors)
	}
	return getSuccessMessage<'Register data is valid', RegisterData>('Register data is valid', result as RegisterData)
}

export default validateRegisterDto
