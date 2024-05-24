import { IsIn, IsNumber, IsOptional } from 'class-validator';

export abstract class BasePaginateDTO {
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  @IsIn(['ASC', 'DESC'])
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  @IsNumber()
  take: number = 20;

  @IsNumber()
  @IsOptional()
  page?: number;
}
