import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common'
import { PostsService } from './posts.service'
import { Request } from 'express'
import { PostDto } from '../../utils/validators/validatePostDto'

@Controller('posts')
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Post()
	async createPost(@Req() req: Request, @Body() createPostDto: PostDto) {
		return await this.postsService.createPost(req.cookies.jwt, createPostDto)
	}

	@Get()
	async getPosts() {
		return await this.postsService.getPosts()
	}

	@Get('/:id')
	async getPost(@Param('id') id: string) {
		return await this.postsService.getPost(id)
	}

	@Put('/:id')
	async updatePost(@Req() req: Request, @Param('id') id: string, @Body() updatePostDto: PostDto) {
		return await this.postsService.updatePost(req.cookies.jwt, id, updatePostDto)
	}
}
