import { Injectable } from '@nestjs/common'
import * as JWT from 'jsonwebtoken'
import { JWTPayload } from 'jsonwebtoken'
import prisma from '../../../prisma/client'
import { User } from '@prisma/client'
import getErrorMessage from '../../utils/getErrorMessage'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { ErrorResponse, SuccessResponse } from '../../types/Response'

type GetUsers =
	| ErrorResponse<'Unauthorized' | 'You have no permissions for this query'>
	| SuccessResponse<'Successfully got all users', Omit<User, 'password'>[]>

@Injectable()
export class UsersService {
	public async getUsers(jwt: unknown): Promise<GetUsers> {
		let payload: JWTPayload
		try {
			payload = JWT.verify(jwt, process.env.SECRET)
		} catch (e) {
			return getErrorMessage<'Unauthorized'>('Unauthorized')
		}

		if (!payload || !payload.id) {
			return getErrorMessage<'Unauthorized'>('Unauthorized')
		}

		const user: User = await prisma.user.findFirst({
			where: {
				id: payload.id,
			},
		})

		if (!user) {
			return getErrorMessage<'Unauthorized'>('Unauthorized')
		}

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
}
