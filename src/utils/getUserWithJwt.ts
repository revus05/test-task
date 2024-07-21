import getErrorMessage from './getErrorMessage'
import { JWTPayload } from 'jsonwebtoken'
import * as JWT from 'jsonwebtoken'
import { ErrorResponse, SuccessResponse } from '../types/Response'
import { User } from '@prisma/client'
import getSuccessMessage from './getSuccessMessage'
import { PrismaService } from '../modules/prisma/prisma.service'

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

	const prisma = new PrismaService()
	const user: Omit<User, 'password'> = await prisma.user.findUnique({
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
