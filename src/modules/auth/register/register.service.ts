import { Injectable } from '@nestjs/common'
import { ErrorResponse, SuccessResponse } from '../../../types/Response'
import { $Enums, User } from '@prisma/client'
import validateRegisterDto, { RegisterDtoValidationErrors } from '../../../utils/validateRegisterDto'
import prisma from '../../../../prisma/client'
import * as bcrypt from 'bcryptjs'
import getSuccessMessage from '../../../utils/getSuccessMessage'
import getErrorMessage from '../../../utils/getErrorMessage'
import handleUniqueConstraintError from '../../../utils/handleUniqueConstraintError'

export type RegisterDto = {
	email?: unknown
	password?: unknown
	role?: unknown
}

export type RegisterData = {
	email: string
	password: string
	role: $Enums.Role
}

type RegisterUser =
	| ErrorResponse<
			RegisterDtoValidationErrors[] | `Unhandled error happened` | `User with this email already existing`
	  >
	| SuccessResponse<'User registered successfully', Omit<User, 'password'>>

@Injectable()
export class RegisterService {
	public async registerUser(registerDto: RegisterDto) {
		const validationResult = validateRegisterDto(registerDto)
		if (validationResult.status !== 'ok') {
			return validationResult
		}

		return await this.createUser(validationResult.data)
	}

	private async createUser(data: RegisterData): Promise<RegisterUser> {
		try {
			const newUser: Omit<User, 'password'> = await prisma.user.create({
				data: {
					email: data.email,
					password: await bcrypt.hash(data.password, await bcrypt.genSalt(4)),
					role: data.role,
				},
				omit: {
					password: true,
				},
			})
			if (newUser) {
				return getSuccessMessage<'User registered successfully', Omit<User, 'password'>>(
					'User registered successfully',
					newUser,
				)
			}
		} catch (error) {
			return handleUniqueConstraintError(error)
		}
		return getErrorMessage('Unhandled error happened')
	}
}
