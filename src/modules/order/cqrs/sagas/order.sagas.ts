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
import { PrismaService } from '@/core/database/prisma.service';
import { VnSkyProfileDataRaw } from '../../types/vnsky-profile-data-raw.type';
import { GetOtpCommand } from '../commands/get-otp.handler';
import { GenContractNumberCommand } from '../commands/gen-contract-number.handler';
import { ConfirmOtpCommand } from '../commands/confirm-otp.handler';
import { ContractSigningCheckerCommand } from '../commands/contract-signing-checker';
import { ActivateCommand } from '../commands/activate.handler';
import { CheckSimAfterRegCommand } from '../commands/check-sim-after-reg.handler';
import { GenContractCommand } from '../commands/gen-contract.handler';
import { SubmitContractSignatureCommand } from '../commands/submit-contract-signature.handler';

type NextStepBuilder = (
	orderId: string,
	event: OrderStepSuccessEvent,
	prisma: PrismaService,
) => Promise<ICommand | null> | ICommand | null;

const ORDER_FLOW_CONFIG: Partial<Record<OrderStepEnum, NextStepBuilder>> = {
	[OrderStepEnum.CHECK_SIM_BEFORE_REG]: (orderId) => new OcrCommand(orderId),

	[OrderStepEnum.OCR]: (orderId) => new GenCustomerCodeCommand(orderId),

	[OrderStepEnum.GENERATE_CUSTOMER_CODE]: (orderId) =>
		new GenSecretKeyCommand(orderId),

	[OrderStepEnum.GENERATE_SECRET_KEY]: async (orderId, event, prisma) => {
		const profile = await prisma.profile.findUnique({
			where: { orderId: orderId },
			select: { rawData: true },
		});

		const profileData = new VnSkyProfileDataRaw(profile?.rawData as any);
		if (profileData.listPhoneNumber && profileData.listPhoneNumber.length > 0) {
			return new GetOtpCommand(orderId);
		}

		return new CheckProfileCommand(orderId);
	},

	[OrderStepEnum.CHECK_PROFILE]: (orderId) =>
		new GenContractNumberCommand(orderId),

	[OrderStepEnum.GET_OTP]: (orderId) => new ConfirmOtpCommand(orderId),

	[OrderStepEnum.CONFIRM_OTP]: (orderId) =>
		new GenContractNumberCommand(orderId),

	[OrderStepEnum.GENERATE_CONTRACT_NUMBER]: (orderId) =>
		new GenContractCommand(orderId),

	[OrderStepEnum.GENERATE_CONTRACT]: (orderId) =>
		new SubmitContractSignatureCommand(orderId),

	[OrderStepEnum.SUBMIT_CONTRACT_SIGNATURE]: (orderId) =>
		new ContractSigningCheckerCommand(orderId),

	[OrderStepEnum.CONTRACT_SIGNING_CHECKER]: (orderId) =>
		new ActivateCommand(orderId),

	[OrderStepEnum.ACTIVATE]: (orderId) => new CheckSimAfterRegCommand(orderId),

	[OrderStepEnum.CHECK_SIM_AFTER_REG]: (orderId) => null,
};

@Injectable()
export class OrderSagas {
	constructor(
		private readonly logger: MyLoggerService,
		private readonly prisma: PrismaService,
	) {}

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
			mergeMap(async (event) => {
				const { orderId, step } = event;
				const commands: ICommand[] = [];

				this.logger.log(
					`[Flow] Step ${OrderStepEnum[step]} success for ${orderId}`,
				);
				commands.push(
					new UpdateOrderCommand(orderId, {
						step: step,
						note: `Step ${OrderStepEnum[step]} Success`,
					}),
				);

				const nextStepBuilder = ORDER_FLOW_CONFIG[step];

				if (nextStepBuilder) {
					try {
						const nextCommand = await nextStepBuilder(
							orderId,
							event,
							this.prisma,
						);

						if (nextCommand) {
							this.logger.log(
								`Dispatching [${nextCommand.constructor.name}] for order ${orderId}`,
							);
							commands.push(nextCommand);
						} else {
							this.logger.log(`Flow finished for order ${orderId}`);
						}
					} catch (error) {
						this.logger.error(
							`Error calculating next step for ${orderId}: ${error.message}`,
						);
					}
				} else {
					this.logger.warn(
						`No next step defined in config for ${OrderStepEnum[step]}`,
					);
				}

				return commands;
			}),
			mergeMap((cmds) => cmds),
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
