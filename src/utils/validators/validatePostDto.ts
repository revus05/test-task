import getErrorMessage from '../getErrorMessage'
import getSuccessMessage from '../getSuccessMessage'
import { ValidatorErrors } from './validator'
import titleValidator from './titleValidator'
import contentValidator from './contentValidator'

export type PostDto = {
	title?: unknown
	content?: unknown
}

export type CreatePostData = {
	title: string
	content: string
}

type IsRequired = {
	title?: boolean
	content?: boolean
}

const validatePostDto = (
	createPostDto: PostDto,
	isRequired: IsRequired = {
		title: true,
		content: true,
	},
) => {
	const result: Partial<CreatePostData> = {}
	const errors: ValidatorErrors<'title' | 'content'>[] = []

	const titleValidationError = titleValidator(createPostDto.title, isRequired.title)
	if (titleValidationError) {
		errors.push(titleValidationError)
	} else {
		result.title = createPostDto.title as string
	}

	const contentValidationError = contentValidator(createPostDto.content, isRequired.content)
	if (contentValidationError) {
		errors.push(contentValidationError)
	} else {
		result.content = createPostDto.content as string
	}

	if (errors.length) {
		return getErrorMessage<ValidatorErrors<'title' | 'content'>[]>(errors)
	}
	return getSuccessMessage('Post data is valid', result as CreatePostData)
}

export default validatePostDto
