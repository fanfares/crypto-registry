import { BadRequestException, ValidationError } from '@nestjs/common';

export const processValidationErrors = (
  validationErrors: ValidationError[] = []
): BadRequestException => {
  console.error(new Error('Validation pipe error'), validationErrors);
  const formattedErrors: string[] = getErrorsFromArray(validationErrors);
  let first = true;
  const str = formattedErrors.reduce((e, err) => {
    const res = (first ? '' : ', ') + err;
    first = false;
    return e + res;
  }, '' )
  return new BadRequestException(str);
};

function getErrorsFromArray(validationErrors: ValidationError[]): string[] {
  let ret: string[] = [];
  validationErrors.forEach((validationError) => {
    ret = ret.concat(getErrors(validationError));
  });
  return ret;
}

const getErrors = (validationError: ValidationError) => {
  let ret: string[] = [];
  if (validationError.children && validationError.children.length > 0) {
    ret = ret.concat(getErrorsFromArray(validationError.children));
  }
  if (validationError.constraints) {
    const constraints = Object.keys(validationError.constraints);
    constraints.forEach((constraintName) => {
      ret.push(validationError.constraints[constraintName]);
    });
  }
  return ret;
};
