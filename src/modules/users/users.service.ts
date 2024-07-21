import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import getUserWithJwt from '../../utils/getUserWithJwt'
import handleUniqueConstraintError from '../../utils/handleUniqueConstraintError'
import isUserOrAdmin from '../../utils/isUserOrAdmin'
import validateUserDto, { UserDto } from '../../utils/validators/validateUserDto'
import { PrismaService } from '../prisma/prisma.service'
import { PaginationDto } from '../pagination.dto'

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	public async getUsers(jwt: unknown, paginationDto: PaginationDto): Promise<Omit<User, 'password'>[]> {
		const getUserWithJwtResponse = await getUserWithJwt(jwt)
		if (getUserWithJwtResponse.status === 'error') {
			throw new HttpException(getUserWithJwtResponse.message, HttpStatus.UNAUTHORIZED)
		}

		const user: Omit<User, 'password'> = getUserWithJwtResponse.data

		if (user.role !== 'ADMIN') {
			throw new HttpException('You have no permissions for this query', HttpStatus.FORBIDDEN)
		}

		let users: Omit<User, 'password'>[]
		try {
			const { page = 1, limit = 10, search = '' } = paginationDto
			const skip = (page - 1) * limit
			users = await this.prisma.user.findMany({
				omit: {
					password: true,
				},
				skip,
				take: +limit,
				where: search
					? {
							OR: [
								{
									email: {
										contains: search,
									},
								},
							],
						}
					: {},
			})
		} catch (e) {
			throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		if (!users.length) {
			throw new HttpException('No users found', HttpStatus.BAD_REQUEST)
		}

		return users
	}

	public async getUser(jwt: unknown, id: string): Promise<Omit<User, 'password'>> {
		const isUserOrAdminResponse = await isUserOrAdmin(jwt, id)
		if (isUserOrAdminResponse.status === 'error') {
			throw new HttpException(isUserOrAdminResponse.message, HttpStatus.FORBIDDEN)
		}

		return isUserOrAdminResponse.data
	}

	public async updateUser(jwt: unknown, id: string, updateBodyDto: UserDto): Promise<Omit<User, 'password'>> {
		const numericId = +id
		if (!numericId) {
			throw new HttpException('Wrong id provided', HttpStatus.BAD_REQUEST)
		}

		const getUserWithJwtResponse = await getUserWithJwt(jwt)
		if (getUserWithJwtResponse.status === 'error') {
			throw new HttpException(getUserWithJwtResponse.message, HttpStatus.UNAUTHORIZED)
		}
		const user: Omit<User, 'password'> = getUserWithJwtResponse.data

		if (user.id !== numericId && user.role !== 'ADMIN') {
			throw new HttpException('You have no permissions for this query', HttpStatus.FORBIDDEN)
		}

		const UserDtoValidationResponse = await validateUserDto(updateBodyDto, {
			email: false,
			password: false,
			role: false,
		})
		if (UserDtoValidationResponse.status === 'error') {
			throw new HttpException(UserDtoValidationResponse.message, HttpStatus.BAD_REQUEST)
		}

		const validatedData = UserDtoValidationResponse.data

		let updatedUser: Omit<User, 'password'>
		try {
			updatedUser = await this.prisma.user.update({
				where: {
					id: numericId,
				},
				data: {
					...validatedData,
				},
				omit: {
					password: true,
				},
			})
		} catch (e) {
			handleUniqueConstraintError(e)
		}

		return updatedUser
	}

	public async deleteUser(jwt: unknown, id: string): Promise<Omit<User, 'password'>> {
		const isUserOrAdminResponse = await isUserOrAdmin(jwt, id)
		if (isUserOrAdminResponse.status === 'error') {
			throw new HttpException(isUserOrAdminResponse.message, HttpStatus.FORBIDDEN)
		}

		let deletedUser: Omit<User, 'password'>
		try {
			deletedUser = await this.prisma.user.delete({
				where: {
					id: +id,
				},
				omit: {
					password: true,
				},
			})
		} catch (e) {
			throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		if (!deletedUser) {
			throw new HttpException('No user found', HttpStatus.BAD_REQUEST)
		}

		return deletedUser
	}
}
