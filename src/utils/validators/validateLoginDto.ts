import { ValidatorErrors } from './validator'
import getErrorMessage from '../getErrorMessage'
import getSuccessMessage from '../getSuccessMessage'
import emailValidator from './emailValidator'
import passwordValidator from './passwordValidator'
import { LoginCredentials, LoginCredentialsDto } from '../../modules/auth/login/login.service'
import { ErrorResponse, SuccessResponse } from '../../types/Response'

export type LoginCredentialsValidationErrors = ValidatorErrors<'email' | 'password'>

const validateLoginCredentialsDto = (
	loginCredentialsDto: LoginCredentialsDto,
):
	| ErrorResponse<LoginCredentialsValidationErrors[]>
	| SuccessResponse<'Login credentials is valid', LoginCredentials> => {
	const result: Partial<LoginCredentials> = {}
	const errors: LoginCredentialsValidationErrors[] = []

	const emailValidationError = emailValidator(loginCredentialsDto.email)
	if (emailValidationError) {
		errors.push(emailValidationError)
	} else {
		result.email = loginCredentialsDto.email as string
	}

	const passwordValidationError = passwordValidator(loginCredentialsDto.password)
	if (passwordValidationError) {
		errors.push(passwordValidationError)
	} else {
		result.password = loginCredentialsDto.password as string
	}

	if (errors.length) {
		return getErrorMessage<LoginCredentialsValidationErrors[]>(errors)
	}
	return getSuccessMessage('Login credentials is valid', result as LoginCredentials)
}

export default validateLoginCredentialsDto
