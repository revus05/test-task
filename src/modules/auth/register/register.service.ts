import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { $Enums, User } from '@prisma/client'
import validateUserDto, { UserData } from '../../../utils/validators/validateUserDto'
import * as bcrypt from 'bcryptjs'
import handleUniqueConstraintError from '../../../utils/handleUniqueConstraintError'
import { PrismaService } from '../../prisma/prisma.service'

export type RegisterDto = {
	email?: unknown
	password?: unknown
	role?: unknown
}

export type RegisterData = {
	email: string
	password: string
	role: $Enums.Role
}
@Injectable()
export class RegisterService {
	constructor(private prisma: PrismaService) {}
	public async registerUser(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
		const validationUserDtoResult = validateUserDto(registerDto)
		if (validationUserDtoResult.status !== 'ok') {
			throw new HttpException(validationUserDtoResult.message, HttpStatus.BAD_REQUEST)
		}

		return await this.createUser(validationUserDtoResult.data as UserData)
	}

	private async createUser(data: RegisterData): Promise<Omit<User, 'password'>> {
		try {
			const newUser: Omit<User, 'password'> = await this.prisma.user.create({
				data: {
					email: data.email,
					password: await bcrypt.hash(data.password, await bcrypt.genSalt(4)),
					role: data.role,
				},
				omit: {
					password: true,
				},
			})
			if (newUser) {
				return newUser
			}
		} catch (error) {
			handleUniqueConstraintError(error)
		}
		throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
	}
}
