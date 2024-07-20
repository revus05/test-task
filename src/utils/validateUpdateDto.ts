import { ValidatorErrors } from './validator'
import emailValidator from './emailValidator'
import passwordValidator from './passwordValidator'
import roleValidator from './roleValidator'
import { $Enums } from '@prisma/client'
import getErrorMessage from './getErrorMessage'
import { UpdateBody, UpdateBodyDto } from '../modules/users/users.service'
import * as bcrypt from 'bcryptjs'
import getSuccessMessage from './getSuccessMessage'

const validateUpdateDto = async (updateBodyDto: UpdateBodyDto) => {
	const errors: ValidatorErrors<'email' | 'password' | 'role'>[] = []
	const result: Partial<UpdateBody> = {}

	if (updateBodyDto.email) {
		const emailValidationErrors = emailValidator(updateBodyDto.email)
		if (emailValidationErrors) {
			errors.push(emailValidationErrors)
		} else {
			result.email = updateBodyDto.email as string
		}
	}
	if (updateBodyDto.password) {
		const passwordValidationErrors = passwordValidator(updateBodyDto.password)
		if (passwordValidationErrors) {
			errors.push(passwordValidator(updateBodyDto.password))
		} else {
			result.password = await bcrypt.hash(updateBodyDto.password, await bcrypt.genSalt(4))
		}
	}
	if (updateBodyDto.role) {
		const roleValidationErrors = roleValidator(updateBodyDto.role)
		if (roleValidationErrors) {
			errors.push(roleValidationErrors)
		} else {
			result.role = updateBodyDto.role as $Enums.Role
		}
	}

	if (errors.length) {
		return getErrorMessage<ValidatorErrors<'email' | 'password' | 'role'>[]>(errors)
	}

	return getSuccessMessage<'Update data is valid', Partial<UpdateBody>>('Update data is valid', result)
}

export default validateUpdateDto
