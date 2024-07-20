import { Body, Controller, Delete, Get, Param, Put, Req } from '@nestjs/common'
import { UsersService } from './users.service'
import { Request } from 'express'
import { UserDto } from '../../utils/validators/validateUserDto'

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
	async updateUser(@Req() req: Request, @Param('id') id: string, @Body() updateBodyDto: UserDto) {
		return await this.usersService.updateUser(req.cookies?.jwt, id, updateBodyDto)
	}

	@Delete('/:id')
	async deleteUser(@Req() req: Request, @Param('id') id: string) {
		return await this.usersService.deleteUser(req.cookies?.jwt, id)
	}
}
