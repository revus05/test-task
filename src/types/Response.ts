export type Response<SuccessMessage, ErrorMessage, Data> =
	| SuccessResponse<SuccessMessage, Data>
	| ErrorResponse<ErrorMessage>

export type SuccessResponse<SuccessMessage, Data> = {
	status: 'ok'
	message: SuccessMessage
	data: Data | null
}

export type ErrorResponse<ErrorMessage> = {
	status: 'error'
	message: ErrorMessage
}
