import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { validateDomainName, validateURL } from 'src/utils/validators';

export function IsAllUrl(validationOptions?: ValidationOptions) {
  return function (obj: object, propertyName: string) {
    registerDecorator({
      name: 'IsAllUrl',
      target: obj.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            typeof value === 'object' &&
            new Array(value).every((x) => validateURL(x))
          );
        },
      },
    });
  };
}

export function IsAllDomains(validationOptions?: ValidationOptions) {
  return function (obj: object, propertyName: string) {
    registerDecorator({
      name: 'IsAllDomains',
      target: obj.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            typeof value === 'object' &&
            new Array(value).every((x) => validateDomainName(x))
          );
        },
      },
    });
  };
}
