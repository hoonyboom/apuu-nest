import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginatePostDTO {
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id_less_than?: number;

  @IsIn(['ASC', 'DESC'])
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  @IsNumber()
  take: number = 20;

  @IsNumber()
  @IsOptional()
  page?: number;
}
