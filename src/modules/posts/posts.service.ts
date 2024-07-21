import { Injectable } from '@nestjs/common'
import getUserWithJwt from '../../utils/getUserWithJwt'
import { Post, User } from '@prisma/client'
import validatePostDto, { PostDto } from '../../utils/validators/validatePostDto'
import getErrorMessage from '../../utils/getErrorMessage'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { ErrorResponse, SuccessResponse } from '../../types/Response'
import { ValidatorErrors } from '../../utils/validators/validator'
import { PrismaService } from '../prisma/prisma.service'

type CreatePost =
	| ErrorResponse<ValidatorErrors<'title' | 'content'>[] | 'Unauthorized' | 'Unhandled error happened'>
	| SuccessResponse<'Successfully created post', Post>

type GetPosts = ErrorResponse<'Unhandled error happened'> | SuccessResponse<'Successfully got all posts', Post[]>

type GetPost =
	| ErrorResponse<'Unhandled error happened' | 'Wrong id provided'>
	| SuccessResponse<'Successfully got post', Post>

type UpdatePost =
	| ErrorResponse<
			| ValidatorErrors<'title' | 'content'>[]
			| 'Unauthorized'
			| 'Wrong id provided'
			| 'Unhandled error happened'
			| 'You got no post with this id'
	  >
	| SuccessResponse<'Successfully updated post', Post>

type DeletePost =
	| ErrorResponse<
			| 'Unhandled error happened'
			| 'Wrong id provided'
			| "You don't have such post"
			| 'Unauthorized'
			| 'You have no permissions for this query'
			| 'No post with id you provided'
	  >
	| SuccessResponse<'Successfully deleted post', Post>

@Injectable()
export class PostsService {
	constructor(private prisma: PrismaService) {}
	public async createPost(jwt: unknown, createPostDto: PostDto): Promise<CreatePost> {
		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}

		const validateResponse = validatePostDto(createPostDto)
		if (validateResponse.status === 'error') {
			return validateResponse
		}

		const user: Omit<User, 'password'> = response.data
		const postData = validateResponse.data

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
			return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
		}

		if (!newPost) {
			return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
		}

		return getSuccessMessage<'Successfully created post', Post>('Successfully created post', newPost)
	}

	public async getPosts(): Promise<GetPosts> {
		let posts: Post[]
		try {
			posts = await this.prisma.post.findMany({})
		} catch (e) {
			return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
		}

		return getSuccessMessage<'Successfully got all posts', Post[]>('Successfully got all posts', posts)
	}

	public async getPost(id: string): Promise<GetPost> {
		const numericId = +id
		if (!numericId) {
			return getErrorMessage<'Wrong id provided'>('Wrong id provided')
		}

		let post: Post
		try {
			post = await this.prisma.post.findFirst({
				where: {
					id: numericId,
				},
			})
		} catch (e) {
			return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
		}

		return getSuccessMessage<'Successfully got post', Post>('Successfully got post', post)
	}

	public async updatePost(jwt: unknown, id: string, updatePostDto: PostDto): Promise<UpdatePost> {
		const numericId = +id
		if (!numericId) {
			return getErrorMessage<'Wrong id provided'>('Wrong id provided')
		}

		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}

		const validateResponse = validatePostDto(updatePostDto, {
			title: false,
			content: false,
		})
		if (validateResponse.status === 'error') {
			return validateResponse
		}

		const user: Omit<User, 'password'> = response.data

		let updatedPost: Post
		try {
			updatedPost = await this.prisma.post.update({
				where: {
					id: numericId,
					userId: user.id,
				},
				data: { ...validateResponse.data },
			})
		} catch (e) {
			return getErrorMessage('Unhandled error happened')
		}

		if (!updatedPost) {
			return getErrorMessage<'You got no post with this id'>('You got no post with this id')
		}

		return getSuccessMessage<'Successfully updated post', Post>('Successfully updated post', updatedPost)
	}

	public async deletePost(jwt: unknown, id: string): Promise<DeletePost> {
		const numericId = +id
		if (!numericId) {
			return getErrorMessage<'Wrong id provided'>('Wrong id provided')
		}

		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}

		const user: Omit<User, 'password'> = response.data

		const post: Post = await this.prisma.post.findFirst({
			where: {
				id: numericId,
			},
		})

		if (!post) {
			return getErrorMessage<'No post with id you provided'>('No post with id you provided')
		}

		if (user.role !== 'ADMIN' && post.userId !== user.id) {
			return getErrorMessage<'You have no permissions for this query'>('You have no permissions for this query')
		}

		let deletedPost: Post
		try {
			deletedPost = await this.prisma.post.delete({
				where: {
					id: numericId,
				},
			})
		} catch (e) {
			return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
		}

		if (!deletedPost) {
			return getErrorMessage<"You don't have such post">("You don't have such post")
		}

		return getSuccessMessage<'Successfully deleted post', Post>('Successfully deleted post', deletedPost)
	}
}
