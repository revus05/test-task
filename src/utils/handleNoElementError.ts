import { Prisma } from '@prisma/client'
import getErrorMessage from './getErrorMessage'
import { ErrorResponse } from '../types/Response'

type HandleNoElementError<Name extends string> = ErrorResponse<`No ${Name} found` | 'Unhandled error happened'>

const handleNoElementError = <Name extends string>(error: unknown, name: Name): HandleNoElementError<Name> => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === 'P2025') {
			return getErrorMessage<`No ${Name} found`>(`No ${name} found`)
		}
	}
	return getErrorMessage('Unhandled error happened')
}

export default handleNoElementError
