import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as JWT from 'jsonwebtoken'
import validateLoginCredentialsDto from '../../../utils/validators/validateLoginDto'
import { PrismaService } from '../../prisma/prisma.service'

export type LoginCredentialsDto = {
	email?: unknown
	password?: unknown
}

export type LoginCredentials = {
	email: string
	password: string
}

@Injectable()
export class LoginService {
	constructor(private prisma: PrismaService) {}

	public async login(loginCredentialsDto: LoginCredentialsDto): Promise<{ user: Omit<User, 'password'>; jwt: JWT }> {
		const validationLoginCredentialsDtoResult = validateLoginCredentialsDto(loginCredentialsDto)
		if (validationLoginCredentialsDtoResult.status !== 'ok') {
			throw new HttpException(validationLoginCredentialsDtoResult.message, HttpStatus.BAD_REQUEST)
		}

		return await this.getUser(validationLoginCredentialsDtoResult.data)
	}

	private async getUser(credentials: LoginCredentials): Promise<{ user: Omit<User, 'password'>; jwt: JWT }> {
		let user: User
		try {
			user = await this.prisma.user.findUnique({
				where: {
					email: credentials.email,
				},
			})
		} catch (e) {
			throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
		}
		if (!user) {
			throw new HttpException('No user with your credentials found', HttpStatus.BAD_REQUEST)
		}

		if (await bcrypt.compare(credentials.password, user.password)) {
			delete user.password
			return { user, jwt: JWT.sign({ id: user.id }, process.env.SECRET, { expiresIn: '30d' }) }
		}

		throw new HttpException('No user with your credentials found', HttpStatus.BAD_REQUEST)
	}
}
