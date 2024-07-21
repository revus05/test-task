import { $Enums } from '@prisma/client'
import getErrorMessage from '../getErrorMessage'
import getSuccessMessage from '../getSuccessMessage'
import { ValidatorErrors } from './validator'
import emailValidator from './emailValidator'
import passwordValidator from './passwordValidator'
import roleValidator from './roleValidator'

export type UserDtoValidationErrors = ValidatorErrors<'email' | 'password' | 'role'>

export type UserDto = {
	email?: unknown
	password?: unknown
	role?: unknown
}

export type UserData = {
	email: string
	password: string
	role: $Enums.Role
}

type IsRequired = {
	email?: boolean
	password?: boolean
	role?: boolean
}

const validateUserDto = (
	userDto: UserDto,
	isRequired: IsRequired = {
		role: true,
		password: true,
		email: true,
	},
) => {
	const result: Partial<UserData> = {}
	const errors: UserDtoValidationErrors[] = []

	const emailValidationError = emailValidator(userDto.email, isRequired.email)
	if (emailValidationError) {
		errors.push(emailValidationError)
	} else {
		result.email = userDto.email as string
	}

	const passwordValidationError = passwordValidator(userDto.password, isRequired.password)
	if (passwordValidationError) {
		errors.push(passwordValidationError)
	} else {
		result.password = userDto.password as string
	}

	const roleValidationError = roleValidator(userDto.role, isRequired.role)
	if (roleValidationError) {
		errors.push(roleValidationError)
	} else {
		result.role = userDto.role as $Enums.Role
	}

	if (errors.length) {
		return getErrorMessage<UserDtoValidationErrors[]>(errors)
	}
	return getSuccessMessage('User data is valid', result)
}

export default validateUserDto
