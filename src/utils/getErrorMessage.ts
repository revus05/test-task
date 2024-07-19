import { ErrorResponse } from '../types/Response'

const getErrorMessage = <T>(message: T): ErrorResponse<T> => {
	return {
		status: 'error',
		message,
	}
}

export default getErrorMessage
