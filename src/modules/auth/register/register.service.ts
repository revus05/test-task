import { Injectable } from '@nestjs/common'
import { ErrorResponse, SuccessResponse } from '../../../types/Response'
import { $Enums, User } from '@prisma/client'
import validateUserDto, { UserData, UserDtoValidationErrors } from '../../../utils/validators/validateUserDto'
import * as bcrypt from 'bcryptjs'
import getSuccessMessage from '../../../utils/getSuccessMessage'
import getErrorMessage from '../../../utils/getErrorMessage'
import handleUniqueConstraintError, { UniqueConstraintError } from '../../../utils/handleUniqueConstraintError'
import { PrismaService } from '../../prisma/prisma.service'

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
	| ErrorResponse<UserDtoValidationErrors[] | UniqueConstraintError>
	| SuccessResponse<'User registered successfully', Omit<User, 'password'>>

@Injectable()
export class RegisterService {
	constructor(private prisma: PrismaService) {}
	public async registerUser(registerDto: RegisterDto) {
		const validationResult = validateUserDto(registerDto)
		if (validationResult.status !== 'ok') {
			return validationResult
		}

		return await this.createUser(validationResult.data as UserData)
	}

	private async createUser(data: RegisterData): Promise<RegisterUser> {
		try {
			const newUser: Omit<User, 'password'> = await this.prisma.user.create({
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
				return getSuccessMessage('User registered successfully', newUser)
			}
		} catch (error) {
			return handleUniqueConstraintError(error)
		}
		return getErrorMessage('Unhandled error happened')
	}
}
