import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import {
  AppException,
  AppExceptionCode,
} from 'src/shared/exceptions/app.exception';

export const REQUEST_ID_TOKEN_HEADER = 'x-request-id';

export const FORWARDED_FOR_TOKEN_HEADER = 'x-forwarded-for';

export const TIMEZONE_TOKEN_HEADER = 'x-timezone';

export const VALIDATION_PIPE_OPTIONS = {
  transform: true,
  whitelist: true,
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    throw new AppException(
      AppExceptionCode.BAD_REQUEST,
      'Bad request',
      HttpStatus.BAD_REQUEST,
      validationErrors.map((error) => {
        const errorMessage = error.constraints
          ? error.constraints
          : JSON.stringify(error);
        return {
          field: error.property,
          error: errorMessage,
        };
      }),
    );
  },
};
