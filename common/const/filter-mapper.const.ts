import {
  Any,
  ArrayContainedBy,
  ArrayContains,
  ArrayOverlap,
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Raw,
} from 'typeorm';

export type FilterMapperKeys = keyof typeof FILTER_MAPPER;

export const FILTER_MAPPER = {
  more_than: MoreThan,
  less_than: LessThan,
  less_than_or_equal: LessThanOrEqual,
  more_than_or_equal: MoreThanOrEqual,
  equal: Equal,
  like: Like,
  i_like: ILike,
  not: Not,
  in: In,
  any: Any,
  array_contains: ArrayContains,
  array_contained_by: ArrayContainedBy,
  array_overlap: ArrayOverlap,
  is_null: IsNull,
  between: Between,
  raw: Raw,
};
