import { Prisma } from '@prisma/client'
import getErrorMessage from './getErrorMessage'

const handleUniqueConstraintError = (error: unknown) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === 'P2002') {
			return getErrorMessage<`User with this email already existing`>(`User with this email already existing`)
		}
	}
	return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
}

export default handleUniqueConstraintError
