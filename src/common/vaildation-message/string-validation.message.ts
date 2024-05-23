import { ValidationArguments } from 'class-validator';

export function StringValidationMessage({ property }: ValidationArguments) {
  return `${property}은 문자열로 입력해주세요`;
}
