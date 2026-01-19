import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/core/database/prisma.service';
import { ExceptionFactory } from '@/core/exception/exception.factory';

export class UpdateOrderCommand {
	constructor(
		public readonly orderId: string,
		public readonly updateData: {
			step?: number;
			status?: number;
			otp?: string;
			note?: string;
			response?: any;
      errorCode?: number;
		},
	) {}
}

@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler implements ICommandHandler<UpdateOrderCommand> {
	constructor(private readonly prisma: PrismaService) {}

	async execute(command: UpdateOrderCommand) {
		const { orderId, updateData } = command;

		const order = await this.prisma.order.findUnique({
			where: { id: orderId },
		});

    if (!order) throw ExceptionFactory.dataNotFound(`Order: ${orderId}`);

    const respSummary = updateData.response 
      ? ` | response: ${JSON.stringify(updateData.response).substring(0, 500)}` 
      : '';
    const fullNote = `${updateData.note || ''}${respSummary}`;

    const newNote = order.note 
      ? `${order.note} | ${fullNote}` 
      : fullNote;

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        step: updateData.step ?? undefined,
        status: updateData.status ?? undefined,
        note: newNote,
        description: fullNote,
        updatedAt: new Date(),
      },
    });
	}
}
