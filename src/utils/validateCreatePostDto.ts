import { CreatePostData, CreatePostDto } from '../modules/posts/posts.service'
import getErrorMessage from './getErrorMessage'
import getSuccessMessage from './getSuccessMessage'
import validator, { ValidatorErrors } from './validator'

const validateCreatePostDto = (createPostDto: CreatePostDto) => {
	const result: Partial<CreatePostData> = {}
	const errors: ValidatorErrors<'title' | 'content'>[] = []

	const titleValidationError = validator<'title'>(createPostDto.title, {
		name: 'title',
		type: 'string',
		maxLength: 128,
		notEmpty: true,
	})
	if (titleValidationError) {
		errors.push(titleValidationError)
	} else {
		result.title = createPostDto.title as string
	}

	const contentValidationError = validator<'content'>(createPostDto.content, {
		name: 'content',
		type: 'string',
		maxLength: 1024,
		notEmpty: true,
	})
	if (contentValidationError) {
		errors.push(contentValidationError)
	} else {
		result.content = createPostDto.content as string
	}

	if (errors.length) {
		return getErrorMessage<ValidatorErrors<'title' | 'content'>[]>(errors)
	}
	return getSuccessMessage<'Post data is valid', CreatePostData>('Post data is valid', result as CreatePostData)
}

export default validateCreatePostDto
