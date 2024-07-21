import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import getErrorMessage from '../../utils/getErrorMessage'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { ErrorResponse, SuccessResponse } from '../../types/Response'
import getUserWithJwt, { GetUserWithJwtErrors } from '../../utils/getUserWithJwt'
import handleUniqueConstraintError, { UniqueConstraintError } from '../../utils/handleUniqueConstraintError'
import { ValidatorErrors } from '../../utils/validators/validator'
import isUserOrAdmin, { IsUserOrAdminErrors } from '../../utils/isUserOrAdmin'
import validateUserDto, { UserDto } from '../../utils/validators/validateUserDto'
import { PrismaService } from '../prisma/prisma.service'

type GetUsers =
	| ErrorResponse<GetUserWithJwtErrors | 'You have no permissions for this query'>
	| SuccessResponse<'Successfully got all users', Omit<User, 'password'>[]>

type GetUser = ErrorResponse<IsUserOrAdminErrors> | SuccessResponse<'Successfully got user', Omit<User, 'password'>>

type UpdateUser =
	| ErrorResponse<
			| ValidatorErrors<'email' | 'password' | 'role'>[]
			| UniqueConstraintError
			| GetUserWithJwtErrors
			| 'You have no permissions for this query'
			| 'Wrong id provided'
	  >
	| SuccessResponse<'Successfully updated user', Omit<User, 'password'>>

type DeleteUser =
	| ErrorResponse<IsUserOrAdminErrors | 'Unhandled error happened' | 'No user found'>
	| SuccessResponse<'Successfully deleted user', Omit<User, 'password'>>

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	public async getUsers(jwt: unknown): Promise<GetUsers> {
		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}

		const user: Omit<User, 'password'> = response.data

		if (user.role !== 'ADMIN') {
			return getErrorMessage('You have no permissions for this query')
		}

		const users: Omit<User, 'password'>[] = await this.prisma.user.findMany({
			omit: {
				password: true,
			},
		})

		return getSuccessMessage('Successfully got all users', users)
	}

	public async getUser(jwt: unknown, id: string): Promise<GetUser> {
		const response = await isUserOrAdmin(jwt, id)
		if (response.status === 'error') {
			return response
		}

		const queriedUser: Omit<User, 'password'> = response.data

		return getSuccessMessage('Successfully got user', queriedUser)
	}

	public async updateUser(jwt: unknown, id: string, updateBodyDto: UserDto): Promise<UpdateUser> {
		const numericId = +id
		if (!numericId) {
			return getErrorMessage('Wrong id provided')
		}

		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}
		const user: Omit<User, 'password'> = response.data

		if (user.id !== numericId && user.role !== 'ADMIN') {
			return getErrorMessage('You have no permissions for this query')
		}

		const validationResponse = await validateUserDto(updateBodyDto, {
			email: false,
			password: false,
			role: false,
		})
		if (validationResponse.status === 'error') {
			return validationResponse
		}

		const validatedData = validationResponse.data

		let updatedUser
		try {
			updatedUser = await this.prisma.user.update({
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

		return getSuccessMessage('Successfully updated user', updatedUser)
	}

	public async deleteUser(jwt: unknown, id: string): Promise<DeleteUser> {
		const response = await isUserOrAdmin(jwt, id)
		if (response.status === 'error') {
			return response
		}

		let deletedUser: Omit<User, 'password'>
		try {
			deletedUser = await this.prisma.user.delete({
				where: {
					id: +id,
				},
				omit: {
					password: true,
				},
			})
		} catch (e) {
			return getErrorMessage('Unhandled error happened')
		}

		if (!deletedUser) {
			return getErrorMessage('No user found')
		}

		return getSuccessMessage('Successfully deleted user', deletedUser)
	}
}
