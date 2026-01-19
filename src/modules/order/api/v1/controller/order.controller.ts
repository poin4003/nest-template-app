import { BaseController } from '@/core/base/base.controller';
import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { OrderRegDto } from '../dto/order-req.dto';
import { storageConfig } from '@/config/multer/multer.config';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { OrderQueryDto } from '../dto/order-query.dto';
import { StartOrderCommand } from '@/modules/order/cqrs/commands/start-order.handler';
import { GetOrdersQuery } from '@/modules/order/cqrs/queries/get-orders.handler';

@Controller('api/v1/order')
export class OrderController extends BaseController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {
		super();
	}

	@Post('reigster')
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Register order' })
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'cardFront', maxCount: 1 },
				{ name: 'cardBack', maxCount: 1 },
				{ name: 'portrait', maxCount: 1 },
			],
			{ storage: storageConfig },
		),
	)
	async register(
		@Body() dto: OrderRegDto,
		@UploadedFiles()
		files: {
			cardFront: Express.Multer.File[];
			cardBack: Express.Multer.File[];
			portrait: Express.Multer.File[];
		},
	) {
		const cardFrontPath = files.cardFront[0].path;
		const cardBackPath = files.cardBack[0].path;
		const portraitPath = files.portrait[0].path;

		if (!cardFrontPath || !cardBackPath || !portraitPath) {
			throw ExceptionFactory.dataNotFound('Images');
		}

		const command = new StartOrderCommand(
			dto.phoneNumber,
			dto.serial,
			cardFrontPath,
			cardBackPath,
			portraitPath,
		);

		return await this.commandBus.execute(command);
	}

	@Get()
	async getManyOrders(@Query() query: OrderQueryDto) {
    const queryInput = new GetOrdersQuery(
      query.currentPage,
      query.pageSize 
    )

    return this.queryBus.execute(queryInput);
  }
}
