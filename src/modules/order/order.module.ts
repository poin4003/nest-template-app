import { PrismaModule } from '@/core/database/prisma.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { VnSkyModule } from '../vn-sky/vn-sky.module';
import { OrderController } from './api/v1/controller/order.controller';
import { OrderSagas } from './cqrs/sagas/order.sagas';
import { OrderRepository } from './repository/order.repository';
import { StartOrderHandler } from './cqrs/commands/start-order.handler';
import { CheckSimBeforeRegHandler } from './cqrs/commands/check-sim-before-reg.handler';
import { GetOrdersHandler } from './cqrs/queries/get-orders.handler';
import { OcrHandler } from './cqrs/commands/ocr.handler';
import { UpdateOrderHandler } from './cqrs/commands/update-order.handler';
import { GenCustomerCodeHandler } from './cqrs/commands/gen-customer-code.handler';
import { GenSecretKeyHandler } from './cqrs/commands/gen-secret-key.handler';

@Module({
	imports: [CqrsModule, PrismaModule, VnSkyModule],
	controllers: [OrderController],
	providers: [
		OrderSagas,
		StartOrderHandler,
		CheckSimBeforeRegHandler,
		GetOrdersHandler,
		OcrHandler,
		UpdateOrderHandler,
    GenCustomerCodeHandler,
    GenSecretKeyHandler,
		OrderRepository,
	],
})
export class OrderModule {}
