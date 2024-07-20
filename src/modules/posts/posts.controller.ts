import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { CreatePostDto, PostsService } from './posts.service'
import { Request } from 'express'

@Controller('posts')
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Post()
	async createPost(@Req() req: Request, @Body() createPostDto: CreatePostDto) {
		return await this.postsService.createPost(req.cookies.jwt, createPostDto)
	}

	@Get()
	async getPosts() {
		return await this.postsService.getPosts()
	}
}
