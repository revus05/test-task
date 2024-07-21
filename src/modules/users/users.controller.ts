import { Body, Controller, Delete, Get, HttpStatus, Param, Put, Req, Res } from '@nestjs/common'
import { UsersService } from './users.service'
import { Request, Response } from 'express'
import { UserDto } from '../../utils/validators/validateUserDto'
import getSuccessMessage from '../../utils/getSuccessMessage'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	async getUsers(@Req() req: Request, @Res() res: Response) {
		const users = await this.usersService.getUsers(req.cookies?.jwt)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully got all users', users))
	}

	@Get('/:id')
	async getOneUser(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
		const user = await this.usersService.getUser(req.cookies?.jwt, id)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully got user', user))
	}

	@Put('/:id')
	async updateUser(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id') id: string,
		@Body() updateBodyDto: UserDto,
	) {
		const updatedUser = await this.usersService.updateUser(req.cookies?.jwt, id, updateBodyDto)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully updated user', updatedUser))
	}

	@Delete('/:id')
	async deleteUser(@Res() res: Response, @Req() req: Request, @Param('id') id: string) {
		const deletedUser = await this.usersService.deleteUser(req.cookies?.jwt, id)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully deleted user', deletedUser))
	}
}
