import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res } from '@nestjs/common'
import { PostsService } from './posts.service'
import { Request, Response } from 'express'
import { PostDto } from '../../utils/validators/validatePostDto'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { PaginationDto } from '../pagination.dto'

@Controller('posts')
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Post()
	async createPost(@Req() req: Request, @Res() res: Response, @Body() createPostDto: PostDto) {
		const post = await this.postsService.createPost(req.cookies.jwt, createPostDto)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully got all users', post))
	}

	@Get()
	async getPosts(@Res() res: Response, @Query() paginationDto: PaginationDto) {
		const posts = await this.postsService.getPosts(paginationDto)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully got all posts', posts))
	}

	@Get('/:id')
	async getPost(@Res() res: Response, @Param('id') id: string) {
		const post = await this.postsService.getPost(id)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully got post', post))
	}

	@Put('/:id')
	async updatePost(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id') id: string,
		@Body() updatePostDto: PostDto,
	) {
		const updatedPost = await this.postsService.updatePost(req.cookies.jwt, id, updatePostDto)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully updated post', updatedPost))
	}

	@Delete('/:id')
	async deletePost(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
		const deletedPost = await this.postsService.deletePost(req.cookies.jwt, id)
		res.status(HttpStatus.OK).json(getSuccessMessage('Successfully deleted post', deletedPost))
	}
}
