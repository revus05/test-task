import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import getUserWithJwt from '../../utils/getUserWithJwt'
import { Post, User } from '@prisma/client'
import validatePostDto, { PostDto } from '../../utils/validators/validatePostDto'
import { PrismaService } from '../prisma/prisma.service'
import handleNoElementError from '../../utils/handleNoElementError'
import { PaginationDto } from '../pagination.dto'

@Injectable()
export class PostsService {
	constructor(private prisma: PrismaService) {}
	public async createPost(jwt: unknown, createPostDto: PostDto): Promise<Post> {
		const getUserWithJwtResponse = await getUserWithJwt(jwt)
		if (getUserWithJwtResponse.status === 'error') {
			throw new HttpException(getUserWithJwtResponse.message, HttpStatus.UNAUTHORIZED)
		}

		const validatePostDtoResponse = validatePostDto(createPostDto)
		if (validatePostDtoResponse.status === 'error') {
			throw new HttpException(validatePostDtoResponse.message, HttpStatus.BAD_REQUEST)
		}

		const user: Omit<User, 'password'> = getUserWithJwtResponse.data
		const postData = validatePostDtoResponse.data

		let newPost: Post
		try {
			newPost = await this.prisma.post.create({
				data: {
					title: postData.title,
					content: postData.content,
					userId: user.id,
				},
			})
		} catch (e) {
			throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		if (!newPost) {
			throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		return newPost
	}

	public async getPosts(paginationDto: PaginationDto): Promise<Post[]> {
		const { page = 1, limit = 10, search = '' } = paginationDto
		const skip = (page - 1) * limit

		let posts: Post[]
		try {
			posts = await this.prisma.post.findMany({
				skip,
				take: +limit,
				where: search
					? {
							OR: [
								{
									title: {
										contains: search,
									},
								},
								{
									content: {
										contains: search,
									},
								},
							],
						}
					: {},
			})
		} catch (e) {
			throw new HttpException('Error retrieving posts', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		return posts
	}

	public async getPost(id: string): Promise<Post> {
		const numericId = +id
		if (!numericId) {
			throw new HttpException('Wrong id provided', HttpStatus.BAD_REQUEST)
		}

		let post: Post
		try {
			post = await this.prisma.post.findUnique({
				where: {
					id: numericId,
				},
			})
		} catch (e) {
			throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		if (!post) {
			throw new HttpException('Post not found', HttpStatus.BAD_REQUEST)
		}

		return post
	}

	public async updatePost(jwt: unknown, id: string, updatePostDto: PostDto): Promise<Post> {
		const numericId = +id
		if (!numericId) {
			throw new HttpException('Wrong id provided', HttpStatus.BAD_REQUEST)
		}

		const getUserWithJwtResponse = await getUserWithJwt(jwt)
		if (getUserWithJwtResponse.status === 'error') {
			throw new HttpException(getUserWithJwtResponse.message, HttpStatus.UNAUTHORIZED)
		}

		const validatePostDtoResponse = validatePostDto(updatePostDto, {
			title: false,
			content: false,
		})
		if (validatePostDtoResponse.status === 'error') {
			throw new HttpException(validatePostDtoResponse.message, HttpStatus.BAD_REQUEST)
		}

		const user: Omit<User, 'password'> = getUserWithJwtResponse.data

		let updatedPost: Post
		try {
			updatedPost = await this.prisma.post.update({
				where: {
					id: numericId,
					userId: user.id,
				},
				data: { ...validatePostDtoResponse.data },
			})
		} catch (e) {
			handleNoElementError<'post'>(e, 'post')
		}

		if (!updatedPost) {
			throw new HttpException('You got no post with this id', HttpStatus.BAD_REQUEST)
		}

		return updatedPost
	}

	public async deletePost(jwt: unknown, id: string): Promise<Post> {
		const numericId = +id
		if (!numericId) {
			throw new HttpException('Wrong id provided', HttpStatus.BAD_REQUEST)
		}

		const getUserWithJwtResponse = await getUserWithJwt(jwt)
		if (getUserWithJwtResponse.status === 'error') {
			throw new HttpException(getUserWithJwtResponse.message, HttpStatus.UNAUTHORIZED)
		}

		const user: Omit<User, 'password'> = getUserWithJwtResponse.data

		let post: Post
		try {
			post = await this.prisma.post.findUnique({
				where: {
					id: numericId,
				},
			})
		} catch (e) {
			throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		if (!post) {
			throw new HttpException('No post with id you provided', HttpStatus.BAD_REQUEST)
		}

		if (user.role !== 'ADMIN' && post.userId !== user.id) {
			throw new HttpException('You have no permissions for this query', HttpStatus.FORBIDDEN)
		}

		let deletedPost: Post
		try {
			deletedPost = await this.prisma.post.delete({
				where: {
					id: numericId,
				},
			})
		} catch (e) {
			throw new HttpException('Unhandled error happened', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		if (!deletedPost) {
			throw new HttpException("You don't have such post", HttpStatus.BAD_REQUEST)
		}

		return deletedPost
	}
}
