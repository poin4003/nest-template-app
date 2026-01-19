import { OrderStepEnum } from '../../order.enum';

export class OrderStepSuccessEvent {
	constructor(
		public readonly orderId: string,
		public readonly step: OrderStepEnum,
		public readonly response?: any,
	) {}
}
