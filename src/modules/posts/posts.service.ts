import { Injectable } from '@nestjs/common'
import getUserWithJwt from '../../utils/getUserWithJwt'
import { Post, User } from '@prisma/client'
import validateCreatePostDto from '../../utils/validateCreatePostDto'
import prisma from '../../../prisma/client'
import getErrorMessage from '../../utils/getErrorMessage'
import getSuccessMessage from '../../utils/getSuccessMessage'
import { ErrorResponse, SuccessResponse } from '../../types/Response'
import { ValidatorErrors } from '../../utils/validator'

export type CreatePostDto = {
	title?: unknown
	content?: unknown
}

export type CreatePostData = {
	title: string
	content: string
}

type CreatePost =
	| ErrorResponse<ValidatorErrors<'title' | 'content'>[] | 'Unauthorized' | 'Unhandled error happened'>
	| SuccessResponse<'Successfully created post', Post>

@Injectable()
export class PostsService {
	public async createPost(jwt: unknown, createPostDto: CreatePostDto): Promise<CreatePost> {
		const response = await getUserWithJwt(jwt)
		if (response.status === 'error') {
			return response
		}

		const validateResponse = validateCreatePostDto(createPostDto)
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
}