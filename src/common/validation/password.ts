import { Matches, MinLength } from 'class-validator';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
export const PASSWORD_DESCRIPTION =
  'A senha deve ter ao menos 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.';

export function StrongPassword() {
  return function (target: object, propertyKey: string | symbol) {
    MinLength(PASSWORD_MIN_LENGTH)(target, propertyKey as string);
    Matches(PASSWORD_REGEX, {
      message: PASSWORD_DESCRIPTION,
    })(target, propertyKey as string);
  };
}
