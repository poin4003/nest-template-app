export enum ActionLogTypeEnum {
	UNKNOWN = 1,
	VNSKY_LOGIN = 2,
	VNSKY_REFRESH_TOKEN = 3,
	VNSKY_PROFILE = 4,
  VNSKY_CHECK_SIM = 5,
  VNSKY_OCR = 6,
}

export enum ActionLogStatusEnum {
	SUCCESS = 1,
	FAILURE = 2,
}
