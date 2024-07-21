import getErrorMessage from './getErrorMessage'
import { JWTPayload } from 'jsonwebtoken'
import * as JWT from 'jsonwebtoken'
import { ErrorResponse, SuccessResponse } from '../types/Response'
import { User } from '@prisma/client'
import getSuccessMessage from './getSuccessMessage'
import { PrismaService } from '../modules/prisma/prisma.service'

export type GetUserWithJwtErrors = 'Unauthorized' | 'Unhandled error happened'

type GetUserWithJwt =
	| ErrorResponse<GetUserWithJwtErrors>
	| SuccessResponse<'Successfully got user', Omit<User, 'password'>>

const getUserWithJwt = async (jwt: unknown): Promise<GetUserWithJwt> => {
	let payload: JWTPayload
	try {
		payload = JWT.verify(jwt, process.env.SECRET)
	} catch (e) {
		return getErrorMessage('Unauthorized')
	}

	if (!payload || !payload.id) {
		return getErrorMessage('Unauthorized')
	}

	const prisma = new PrismaService()
	let user: Omit<User, 'password'>
	try {
		user = await prisma.user.findUnique({
			where: {
				id: payload.id,
			},
			omit: {
				password: true,
			},
		})
	} catch (e) {
		return getErrorMessage('Unhandled error happened')
	}

	if (!user) {
		return getErrorMessage('Unauthorized')
	}
	return getSuccessMessage('Successfully got user', user)
}

export default getUserWithJwt
