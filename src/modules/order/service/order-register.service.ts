import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CheckSimBeforeRegCommand } from './schemas/order.command';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { PrismaService } from '@/core/database/prisma.service';
import { VnSkyCheckSimQuery } from '@/modules/vn-sky/service/schemas/vn-sky.query';

@CommandHandler(CheckSimBeforeRegCommand)
export class CheckSimBeforeRegHandler implements ICommandHandler<CheckSimBeforeRegCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly publisher: EventBus,
	) {}

	async execute(command: CheckSimBeforeRegCommand) {
		const { orderId } = command;
		const order = await this.prisma.order.findUnique({
			where: { id: orderId },
		});

		const query = new VnSkyCheckSimQuery();
		const result = await this.vnSkyService.vnSkyCheckSim(query);

    // this.publisher.publish();
	}
}
