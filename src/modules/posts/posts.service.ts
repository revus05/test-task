import { Injectable } from '@nestjs/common'
import getUserWithJwt from '../../utils/getUserWithJwt'
import { Post, User } from '@prisma/client'
import validatePostDto, { PostDto } from '../../utils/validators/validatePostDto'
import prisma from '../../../prisma/client'
import getErrorMessage from '../../utils/getErrorMessage'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { ErrorResponse, SuccessResponse } from '../../types/Response'
import { ValidatorErrors } from '../../utils/validators/validator'

type CreatePost =
	| ErrorResponse<ValidatorErrors<'title' | 'content'>[] | 'Unauthorized' | 'Unhandled error happened'>
	| SuccessResponse<'Successfully created post', Post>

type GetPosts = ErrorResponse<'Unhandled error happened'> | SuccessResponse<'Successfully got all posts', Post[]>

type GetPost =
	| ErrorResponse<'Unhandled error happened' | 'Wrong id provided'>
	| SuccessResponse<'Successfully got post', Post>

@Injectable()
export class PostsService {
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
			newPost = await prisma.post.create({
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
			posts = await prisma.post.findMany({})
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
			post = await prisma.post.findFirst({
				where: {
					id: numericId,
				},
			})
		} catch (e) {
			return getErrorMessage<'Unhandled error happened'>('Unhandled error happened')
		}

		return getSuccessMessage<'Successfully got post', Post>('Successfully got post', post)
	}
}
