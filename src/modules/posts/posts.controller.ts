import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseInterceptors } from '@nestjs/common'
import { PostsService } from './posts.service'
import { Request, Response } from 'express'
import { PostDto } from '../../utils/validators/validatePostDto'
import { CacheInterceptor } from '@nestjs/cache-manager'
import getSuccessMessage from '../../utils/getSuccessMessage'

@UseInterceptors(CacheInterceptor)
@Controller('posts')
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Post()
	async createPost(@Req() req: Request, @Res() res: Response, @Body() createPostDto: PostDto) {
		try {
			const post = await this.postsService.createPost(req.cookies.jwt, createPostDto)
			res.status(HttpStatus.OK).json(getSuccessMessage('Successfully created post', post))
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
			const message = error.response || 'Unhandled error happened'

			res.status(status).json({
				statusCode: status,
				status: 'error',
				message: message,
			})
		}
	}

	@Get()
	async getPosts(@Res() res: Response) {
		try {
			const posts = await this.postsService.getPosts()
			res.status(HttpStatus.OK).json(getSuccessMessage('Successfully got all posts', posts))
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
			const message = error.response || 'Unhandled error happened'

			res.status(status).json({
				statusCode: status,
				status: 'error',
				message: message,
			})
		}
	}

	@Get('/:id')
	async getPost(@Res() res: Response, @Param('id') id: string) {
		try {
			const post = await this.postsService.getPost(id)
			res.status(HttpStatus.OK).json(getSuccessMessage('Successfully got post', post))
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
			const message = error.response || 'Unhandled error happened'

			res.status(status).json({
				statusCode: status,
				status: 'error',
				message: message,
			})
		}
	}

	@Put('/:id')
	async updatePost(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id') id: string,
		@Body() updatePostDto: PostDto,
	) {
		try {
			const updatedPost = await this.postsService.updatePost(req.cookies.jwt, id, updatePostDto)
			res.status(HttpStatus.OK).json(getSuccessMessage('Successfully updated post', updatedPost))
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
			const message = error.response || 'Unhandled error happened'

			res.status(status).json({
				statusCode: status,
				status: 'error',
				message: message,
			})
		}
	}

	@Delete('/:id')
	async deletePost(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
		try {
			const deletedPost = await this.postsService.deletePost(req.cookies.jwt, id)
			res.status(HttpStatus.OK).json(getSuccessMessage('Successfully deleted post', deletedPost))
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR
			const message = error.response || 'Unhandled error happened'

			res.status(status).json({
				statusCode: status,
				status: 'error',
				message: message,
			})
		}
	}
}
