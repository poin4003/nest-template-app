import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { map, mergeMap, Observable } from 'rxjs';
import { OrderStartedEvent } from '../events/order-started.event';
import { MyLoggerService } from '@/common/logger/my-logger.service';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { OrderStatusEnum, OrderStepEnum } from '../../order.enum';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { CheckSimBeforeRegCommand } from '../commands/check-sim-before-reg.handler';
import { UpdateOrderCommand } from '../commands/update-order.handler';
import { OcrCommand } from '../commands/ocr.handler';
import { GenCustomerCodeCommand } from '../commands/gen-customer-code.handler';
import { GenSecretKeyCommand } from '../commands/gen-secret-key.handler';
import { CheckProfileCommand } from '../commands/check-profile.handler';

@Injectable()
export class OrderSagas {
	constructor(private readonly logger: MyLoggerService) {}

	@Saga()
	orderFlow = (events$: Observable<any>): Observable<ICommand> => {
		return events$.pipe(
			ofType(OrderStartedEvent),
			map((event) => {
				this.logger.log(
					`[Saga] Order ${event.orderId} started. Dispatching CheckSim...`,
				);
				return new CheckSimBeforeRegCommand(event.orderId);
			}),
		);
	};

	@Saga()
	successFlow = (events$: Observable<any>): Observable<ICommand> => {
		return events$.pipe(
			ofType(OrderStepSuccessEvent),
			mergeMap((event) => {
				const orderId = event.orderId;
				const currentStep = event.step;

				this.logger.log(
					`[FLow] Step ${OrderStepEnum[currentStep]} success for order ${orderId}`,
				);

				const commands: ICommand[] = [];

				commands.push(
					new UpdateOrderCommand(orderId, {
						step: currentStep,
						note: `Step ${OrderStepEnum[currentStep]} Success`,
						response: event.response,
					}),
				);

				switch (currentStep) {
					case OrderStepEnum.CHECK_SIM_BEFORE_REG:
						this.logger.log(`Dispatching OCR for order ${orderId}`);
						commands.push(new OcrCommand(orderId));
						break;
					case OrderStepEnum.OCR:
						this.logger.log(`Dispatching GEN_CUSTOMER_CODE for ${orderId}`);
            commands.push(new GenCustomerCodeCommand(orderId));
						break;
					case OrderStepEnum.GENERATE_CUSTOMER_CODE:
						this.logger.log(`Dispatching GEN_SECRET_KEY for ${orderId}`);
            commands.push(new GenSecretKeyCommand(orderId));
						break;
          case OrderStepEnum.GENERATE_SECRET_KEY:
						this.logger.log(`Dispatching CHECK_PROFILE for ${orderId}`);
            commands.push(new CheckProfileCommand(orderId));
						break;
					case OrderStepEnum.CHECK_PROFILE:
						this.logger.log(
							`Dispatching GENERATE_CONTRACT_NUMBER for ${orderId}`,
						);
						break;
					case OrderStepEnum.GET_OTP:
						this.logger.log(`Dispatching CONFIRM OTP for ${orderId}`);
						break;
					case OrderStepEnum.CONFIRM_OTP:
						this.logger.log(`Dispatching CHECK SIM AFTER REG for ${orderId}`);
						break;
					case OrderStepEnum.GENERATE_CONTRACT_NUMBER:
						this.logger.log(`Dispatching GENERATE_CONTRACT for ${orderId}`);
						break;
					case OrderStepEnum.GENERATE_CONTRACT:
						this.logger.log(`Dispatching GET OTP for ${orderId}`);
						break;
					case OrderStepEnum.CHECK_SIM_AFTER_REG:
						this.logger.log(`Success reg sim for ${orderId}`);
						commands.push(
							new UpdateOrderCommand(orderId, {
								status: OrderStatusEnum.SUCCESS,
								note: 'Order Registration Flow Completed Successfully.',
							}),
						);
						break;
					default:
						this.logger.warn(
							`No next step defined for ${OrderStepEnum[currentStep]}`,
						);
						break;
				}

				return commands;
			}),
		);
	};

	@Saga()
	failureFlow = (events$: Observable<any>): Observable<ICommand> => {
		return events$.pipe(
			ofType(OrderStepFailedEvent),
			map((event) => {
				this.logger.error(
					`[Flow] FAILED at step ${OrderStepEnum[event.step]}. Code: ${event.errorCode}. Msg: ${event.errorMessage}`,
				);

				return new UpdateOrderCommand(event.orderId, {
					step: event.step,
					status: OrderStatusEnum.FAILURE,
					errorCode: event.errorCode,
					note: `FAILED: ${event.errorMessage} (Code: ${event.errorCode})`,
				});
			}),
		);
	};
}
