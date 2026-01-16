import { Injectable } from '@nestjs/common';
import { CreateSimDto } from './dto/create-sim.dto';
import { UpdateSimDto } from './dto/update-sim.dto';
import { MyLoggerService } from 'src/common/logger/my-logger.service';
import { ExceptionFactory } from 'src/core/exception/exception.factory';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class SimsService {
	constructor(
		private readonly logger: MyLoggerService,
		private readonly prisma: PrismaService,
	) {}

	async create(createSimDto: CreateSimDto) {
		return this.prisma.sim.create({
			data: {
				serialNumber: createSimDto.serialNumber,
				phoneNumber: createSimDto.phoneNumber,
			},
		});
	}

	async findAll() {
		return this.prisma.sim.findMany({
			orderBy: { createdAt: 'desc' },
		});
	}

	async findOne(id: number) {
		const sim = await this.prisma.sim.findUnique({ where: { id: id } });
		if (!sim) throw ExceptionFactory.dataNotFound(`Sim id: ${id}`);
		return sim;
	}

	update(id: number, updateSimDto: UpdateSimDto) {
		return `This action updates a #${id} sim`;
	}

	remove(id: number) {
		return `This action removes a #${id} sim`;
	}
}
