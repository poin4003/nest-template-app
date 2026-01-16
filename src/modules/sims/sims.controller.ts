import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { SimsService } from './sims.service';
import { CreateSimDto } from './dto/create-sim.dto';
import { UpdateSimDto } from './dto/update-sim.dto';
import { BaseController } from 'src/core/base/base.controller';

@Controller('sims')
export class SimsController extends BaseController {
	constructor(private readonly simsService: SimsService) {
		super();
	}

	@Post()
	create(@Body() createSimDto: CreateSimDto) {
		const data = this.simsService.create(createSimDto);

		return this.Created(data);
	}

	@Get()
	findAll() {
		return this.simsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: number) {
		const data = this.simsService.findOne(id);

		return this.OK(data);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateSimDto: UpdateSimDto) {
		return this.simsService.update(+id, updateSimDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.simsService.remove(+id);
	}
}
