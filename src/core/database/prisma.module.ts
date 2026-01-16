import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppConfigModule } from '@/config/settings/app-config.module';

@Global()
@Module({
  imports: [AppConfigModule],
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
