export enum OrderStep {
	INIT = 1,
	OCR = 2,
	CONFIRM = 3,
	OTP = 4,
}

export const STEP_CONFIG = {
	[OrderStep.INIT]: { queue: 'step_init_queue', next: OrderStep.OCR },
	[OrderStep.OCR]: { queue: 'step_ocr_queu', next: OrderStep.CONFIRM },
	[OrderStep.CONFIRM]: { queue: 'step_confirm_queue', next: OrderStep.OTP },
};
