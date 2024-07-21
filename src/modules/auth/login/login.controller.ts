import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common'
import { LoginCredentialsDto, LoginService } from './login.service'
import { Response } from 'express'
import getSuccessMessage from '../../../utils/getSuccessMessage'

@Controller('auth/login')
export class LoginController {
	constructor(private readonly loginService: LoginService) {}

	@Post()
	async login(@Body() loginCredentialsDto: LoginCredentialsDto, @Res({ passthrough: true }) res: Response) {
		const response = await this.loginService.login(loginCredentialsDto)
		res.cookie('jwt', response.jwt)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully logged in', response.user))
	}
}
