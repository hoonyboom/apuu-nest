import { ValidationArguments } from 'class-validator';

export function LengthValidationMessage({
  constraints,
  property,
}: ValidationArguments) {
  if (constraints.length === 2) {
    return `${property}은 ${constraints[0]}글자 이상 ${constraints[1]}글자 이하로 입력해주세요`;
  } else if (constraints.length === 1) {
    return `${property}은 ${constraints[0]}글자 이상 입력해주세요`;
  }
}
