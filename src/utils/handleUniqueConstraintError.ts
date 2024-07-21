import { Prisma } from '@prisma/client'
import getErrorMessage from './getErrorMessage'
import { ErrorResponse } from '../types/Response'

export type UniqueConstraintError = 'User with this email already existing' | 'Unhandled error happened'

const handleUniqueConstraintError = (error: unknown): ErrorResponse<UniqueConstraintError> => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === 'P2002') {
			return getErrorMessage(`User with this email already existing`)
		}
	}
	return getErrorMessage('Unhandled error happened')
}

export default handleUniqueConstraintError
