import getErrorMessage from './getErrorMessage'
import getUserWithJwt from './getUserWithJwt'
import { User } from '@prisma/client'
import getSuccessMessage from './getSuccessMessage'
import { PrismaService } from '../modules/prisma/prisma.service'
import { ErrorResponse, SuccessResponse } from '../types/Response'

export type IsUserOrAdminErrors =
	| 'Unhandled error happened'
	| 'No user found'
	| 'You have no permissions for this query'
	| 'Wrong id provided'
	| 'Unauthorized'

type IsUserOrAdmin = ErrorResponse<IsUserOrAdminErrors> | SuccessResponse<'User has access', Omit<User, 'password'>>

const isUserOrAdmin = async (jwt: unknown, id: string): Promise<IsUserOrAdmin> => {
	const numericId = +id
	if (!numericId) {
		return getErrorMessage('Wrong id provided')
	}

	const response = await getUserWithJwt(jwt)
	if (response.status === 'error') {
		return response
	}

	const user: Omit<User, 'password'> = response.data

	const prisma = new PrismaService()
	let queriedUser: Omit<User, 'password'>
	try {
		queriedUser = await prisma.user.findUnique({
			where: {
				id: numericId,
			},
			omit: {
				password: true,
			},
		})
	} catch (e) {
		return getErrorMessage('Unhandled error happened')
	}

	if (!queriedUser) {
		return getErrorMessage('No user found')
	}

	if (user.role !== 'ADMIN' && queriedUser.id !== user.id) {
		return getErrorMessage('You have no permissions for this query')
	}

	return getSuccessMessage('User has access', queriedUser)
}

export default isUserOrAdmin
