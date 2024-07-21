import { Prisma } from '@prisma/client'
import { HttpException, HttpStatus } from '@nestjs/common'

const handleNoElementError = <Name extends string>(error: unknown, name: Name) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === 'P2025') {
			throw new HttpException(`No ${name} found`, HttpStatus.BAD_REQUEST)
		}
	}
	throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
}

export default handleNoElementError
