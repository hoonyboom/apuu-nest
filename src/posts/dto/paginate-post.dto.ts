import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginatePostDTO {
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  @IsIn(['ASC', 'DESC'])
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  @IsNumber()
  @IsOptional()
  take: number = 20;
}
