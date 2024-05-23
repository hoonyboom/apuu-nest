import { ValidationArguments } from 'class-validator';

export function EmailValidationMessage({ property }: ValidationArguments) {
  return `${property}은 이메일 형식으로 입력해주세요`;
}
