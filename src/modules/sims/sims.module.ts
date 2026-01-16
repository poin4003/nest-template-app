import { Module } from '@nestjs/common';
import { SimsService } from './sims.service';
import { SimsController } from './sims.controller';

@Module({
  controllers: [SimsController],
  providers: [SimsService],
})
export class SimsModule {}
