export enum OrderStepEnum {
	START = 1,
	CHECK_SIM_BEFORE_REG = 2,
	OCR = 3,
	GENERATE_CUSTOMER_CODE = 4,
	CHECK_PROFILE = 5,
	GENERATE_CONTRACT_NUMBER = 6,
	GENERATE_CONTRACT = 7,
	GET_OTP = 8,
	CONFIRM_OTP = 9,
	CHECK_SIM_AFTER_REG = 10,
}

export enum OrderStatusEnum {
	INIT = 1,
	SUCCESS = 2,
	FAILURE = 3,
}

export enum OrderTypeEnum {
	NORMAL = 1,
}
