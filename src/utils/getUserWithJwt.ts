import getErrorMessage from './getErrorMessage'
import prisma from '../../prisma/client'
import { JWTPayload } from 'jsonwebtoken'
import * as JWT from 'jsonwebtoken'
import { ErrorResponse, SuccessResponse } from '../types/Response'
import { User } from '@prisma/client'
import getSuccessMessage from './getSuccessMessage'

type GetUserWithJwt = ErrorResponse<'Unauthorized'> | SuccessResponse<'Successfully got user', Omit<User, 'password'>>

const getUserWithJwt = async (jwt: unknown): Promise<GetUserWithJwt> => {
	let payload: JWTPayload
	try {
		payload = JWT.verify(jwt, process.env.SECRET)
	} catch (e) {
		return getErrorMessage<'Unauthorized'>('Unauthorized')
	}

	if (!payload || !payload.id) {
		return getErrorMessage<'Unauthorized'>('Unauthorized')
	}

	const user: Omit<User, 'password'> = await prisma.user.findFirst({
		where: {
			id: payload.id,
		},
		omit: {
			password: true,
		},
	})

	if (!user) {
		return getErrorMessage<'Unauthorized'>('Unauthorized')
	}
	return getSuccessMessage<'Successfully got user', Omit<User, 'password'>>('Successfully got user', user)
}

export default getUserWithJwt
