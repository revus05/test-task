import { Injectable } from '@nestjs/common'
import prisma from '../../../prisma/client'
import { User } from '@prisma/client'
import getErrorMessage from '../../utils/getErrorMessage'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { ErrorResponse, SuccessResponse } from '../../types/Response'
import getUserWithJwt from '../../utils/getUserWithJwt'

type GetUsers =
	| ErrorResponse<'Unauthorized' | 'You have no permissions for this query'>
	| SuccessResponse<'Successfully got all users', Omit<User, 'password'>[]>

type GetUser =
	| ErrorResponse<'Unauthorized' | 'You have no permissions for this query' | 'Wrong id provided'>
	| SuccessResponse<'Successfully got user', Omit<User, 'password'>>

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
		const numericId = +id
		if (!numericId) {
			return getErrorMessage<'Wrong id provided'>('Wrong id provided')
		}

		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}

		const user: Omit<User, 'password'> = response.data

		const queriedUser: Omit<User, 'password'> = await prisma.user.findFirst({
			where: {
				id: numericId,
			},
			omit: {
				password: true,
			},
		})

		if (user.role !== 'ADMIN' && queriedUser.id !== user.id) {
			return getErrorMessage<'You have no permissions for this query'>('You have no permissions for this query')
		}

		return getSuccessMessage<'Successfully got user', Omit<User, 'password'>>('Successfully got user', queriedUser)
	}
}
