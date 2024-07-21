import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common'
import { RegisterDto, RegisterService } from './register.service'
import { Response } from 'express'
import getSuccessMessage from '../../../utils/getSuccessMessage'

@Controller('auth/register')
export class RegisterController {
	constructor(private readonly registerService: RegisterService) {}

	@Post()
	async registerUser(@Res() res: Response, @Body() registerDto: RegisterDto) {
		const registeredUser = await this.registerService.registerUser(registerDto)
		res.status(HttpStatus.OK).json(getSuccessMessage('User registered successfully', registeredUser))
	}
}
