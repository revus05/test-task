import { Injectable } from '@nestjs/common'
import validateLoginCredentialsDto, { LoginCredentialsValidationErrors } from '../../utils/validateLoginCredentialsDto'
import prisma from '../../../prisma/client'
import { User } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import getSuccessMessage from '../../utils/getSuccessMessage'
import * as JWT from 'jsonwebtoken'
import getErrorMessage from '../../utils/getErrorMessage'
import { ErrorResponse, SuccessResponse } from '../../types/Response'

export type LoginCredentialsDto = {
	email?: unknown
	password?: unknown
}

export type LoginCredentials = {
	email: string
	password: string
}

type Login =
	| ErrorResponse<
			LoginCredentialsValidationErrors[] | 'Unhandled error happened' | 'No user with your credentials found'
	  >
	| SuccessResponse<'User logged in successfully', { user: Omit<User, 'password'>; jwt: JWT }>

@Injectable()
export class LoginService {
	public async login(loginCredentialsDto: LoginCredentialsDto): Promise<Login> {
		const validationResult = validateLoginCredentialsDto(loginCredentialsDto)
		if (validationResult.status !== 'ok') {
			return validationResult
		}

		return await this.getUser(validationResult.data)
	}

	private async getUser(data: LoginCredentials): Promise<Login> {
		let user: User
		try {
			user = await prisma.user.findFirst({
				where: {
					email: data.email,
				},
			})
		} catch (e) {
			return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
		}
		if (!user) {
			return getErrorMessage<'No user with your credentials found'>('No user with your credentials found')
		}

		if (await bcrypt.compare(data.password, user.password)) {
			delete user.password
			return getSuccessMessage<'User logged in successfully', { user: Omit<User, 'password'>; jwt: JWT }>(
				'User logged in successfully',
				{ user, jwt: JWT.sign({ id: user.id }, process.env.SECRET, { expiresIn: '30d' }) },
			)
		}

		return getErrorMessage<'No user with your credentials found'>('No user with your credentials found')
	}
}
