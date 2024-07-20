import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common'
import { UpdateBodyDto, UsersService } from './users.service'
import { Request } from 'express'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	async getUsers(@Req() req: Request) {
		return await this.usersService.getUsers(req.cookies?.jwt)
	}

	@Get('/:id')
	async getOneUser(@Req() req: Request, @Param('id') id: string) {
		return await this.usersService.getUser(req.cookies?.jwt, id)
	}

	@Put('/:id')
	async updateUser(@Req() req: Request, @Param('id') id: string, @Body() updateBodyDto: UpdateBodyDto) {
		return await this.usersService.updateUser(req.cookies?.jwt, id, updateBodyDto)
	}
}
