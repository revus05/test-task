import { $Enums } from '@prisma/client'
import getErrorMessage from './getErrorMessage'
import getSuccessMessage from './getSuccessMessage'
import { ValidatorErrors } from './validator'
import emailValidator from './emailValidator'
import passwordValidator from './passwordValidator'
import { RegisterData, RegisterDto } from '../modules/auth/register/register.service'
import roleValidator from './roleValidator'

export type RegisterDtoValidationErrors = ValidatorErrors<'email' | 'password' | 'role'>

const validateRegisterDto = (registerDto: RegisterDto) => {
	const result: Partial<RegisterData> = {}
	const errors: RegisterDtoValidationErrors[] = []

	const emailValidationError = emailValidator(registerDto.email)
	if (emailValidationError) {
		errors.push(emailValidationError)
	} else {
		result.email = registerDto.email as string
	}

	const passwordValidationError = passwordValidator(registerDto.password)
	if (passwordValidationError) {
		errors.push(passwordValidationError)
	} else {
		result.password = registerDto.password as string
	}

	const roleValidationError = roleValidator(registerDto.role)
	if (roleValidationError) {
		errors.push(roleValidationError)
	} else {
		result.role = registerDto.role as $Enums.Role
	}

	if (errors.length) {
		return getErrorMessage<RegisterDtoValidationErrors[]>(errors)
	}
	return getSuccessMessage<'Register data is valid', RegisterData>('Register data is valid', result as RegisterData)
}

export default validateRegisterDto
