import { PagingQueryDto } from '@/common/dto/paging-query.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ActionLogQuery extends PagingQueryDto {
  @ApiPropertyOptional({ description: 'Id object' })
	@IsOptional()
	@IsString()
	objectId?: string;
}
