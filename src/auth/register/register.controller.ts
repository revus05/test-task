import { Body, Controller, Post } from '@nestjs/common'
import { RegisterDto, RegisterService } from './register.service'

@Controller('auth/register')
export class RegisterController {
	constructor(private readonly registerService: RegisterService) {}

	@Post()
	async registerUser(@Body() registerDto: RegisterDto) {
		return await this.registerService.registerUser(registerDto)
	}
}
