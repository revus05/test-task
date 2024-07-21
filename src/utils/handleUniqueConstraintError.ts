import { Prisma } from '@prisma/client'
import { HttpException, HttpStatus } from '@nestjs/common'

const handleUniqueConstraintError = (error: unknown) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === 'P2002') {
			throw new HttpException(`User with this email already existing`, HttpStatus.BAD_REQUEST)
		}
	}
	throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
}

export default handleUniqueConstraintError
