import { Injectable } from '@nestjs/common'
import prisma from '../../../prisma/client'
import { $Enums, User } from '@prisma/client'
import getErrorMessage from '../../utils/getErrorMessage'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { ErrorResponse, SuccessResponse } from '../../types/Response'
import getUserWithJwt from '../../utils/getUserWithJwt'
import handleUniqueConstraintError from '../../utils/handleUniqueConstraintError'
import { ValidatorErrors } from '../../utils/validator'
import validateUpdateDto from '../../utils/validateUpdateDto'
import isUserOrAdmin from '../../utils/isUserOrAdmin'

type GetUsers =
	| ErrorResponse<'Unauthorized' | 'You have no permissions for this query'>
	| SuccessResponse<'Successfully got all users', Omit<User, 'password'>[]>

type GetUser =
	| ErrorResponse<'Unauthorized' | 'You have no permissions for this query' | 'Wrong id provided'>
	| SuccessResponse<'Successfully got user', Omit<User, 'password'>>

type UpdateUser =
	| ErrorResponse<
			| ValidatorErrors<'email' | 'password' | 'role'>[]
			| 'Unhandled error happened'
			| 'User with this email already existing'
			| 'Unauthorized'
			| 'You have no permissions for this query'
			| 'Wrong id provided'
	  >
	| SuccessResponse<'Successfully updated user', Omit<User, 'password'>>

export type UpdateBodyDto = {
	email?: unknown
	password?: unknown
	role?: unknown
}

export type UpdateBody = {
	email: string
	password: string
	role: $Enums.Role
}

@Injectable()
export class UsersService {
	public async getUsers(jwt: unknown): Promise<GetUsers> {
		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}

		const user: Omit<User, 'password'> = response.data

		if (user.role !== 'ADMIN') {
			return getErrorMessage<'You have no permissions for this query'>('You have no permissions for this query')
		}

		const users: Omit<User, 'password'>[] = await prisma.user.findMany({
			omit: {
				password: true,
			},
		})

		return getSuccessMessage<'Successfully got all users', Omit<User, 'password'>[]>(
			'Successfully got all users',
			users,
		)
	}

	public async getUser(jwt: unknown, id: string): Promise<GetUser> {
		const response = await isUserOrAdmin(jwt, id)
		if (response.status === 'error') {
			return response
		}

		const queriedUser = response.data

		return getSuccessMessage<'Successfully got user', Omit<User, 'password'>>('Successfully got user', queriedUser)
	}

	public async updateUser(jwt: unknown, id: string, updateBodyDto: UpdateBodyDto): Promise<UpdateUser> {
		const numericId = +id
		if (!numericId) {
			return getErrorMessage<'Wrong id provided'>('Wrong id provided')
		}

		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}
		const user: Omit<User, 'password'> = response.data

		if (user.id !== numericId && user.role !== 'ADMIN') {
			return getErrorMessage<'You have no permissions for this query'>('You have no permissions for this query')
		}

		const validationResponse = await validateUpdateDto(updateBodyDto)
		if (validationResponse.status === 'error') {
			return validationResponse
		}

		const validatedData = validationResponse.data

		let updatedUser
		try {
			updatedUser = await prisma.user.update({
				where: {
					id: numericId,
				},
				data: {
					...validatedData,
				},
				omit: {
					password: true,
				},
			})
		} catch (e) {
			return handleUniqueConstraintError(e)
		}

		return getSuccessMessage<'Successfully updated user', Omit<User, 'password'>>(
			'Successfully updated user',
			updatedUser,
		)
	}
}
