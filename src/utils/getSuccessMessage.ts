import { SuccessResponse } from '../types/Response'

const getSuccessMessage = <Y extends string, T>(message: Y, data: T): SuccessResponse<Y, T> => {
	return {
		status: 'ok',
		message,
		data,
	}
}

export default getSuccessMessage
