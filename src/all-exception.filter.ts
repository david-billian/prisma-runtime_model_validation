import { FastifyError } from 'fastify';
import { AbstractHttpAdapter } from '@nestjs/core';

import {
  Catch,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
  BadRequestException,
} from '@nestjs/common';
import {
  PrismaClientRustPanicError,
  PrismaClientValidationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
} from '@prisma/client/runtime';
import { ValidationError } from 'webpack';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: AbstractHttpAdapter) {}
  catch(exception: FastifyError, host: ArgumentsHost): void {
    console.log('-----------', exception);

    let errorMessage: unknown;
    let httpStatus: number;
    const httpAdapter = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    if (exception instanceof HttpException) {
      if (exception instanceof BadRequestException) {
        httpStatus = 422;
        errorMessage = exception.getResponse()['message'];
      } else {
        httpStatus = exception.getStatus();
        errorMessage = exception.getResponse()['message'];
      }
    } else if (exception instanceof PrismaClientRustPanicError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientValidationError) {
      httpStatus = 404;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientInitializationError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (
      exception.statusCode &&
      exception.statusCode >= 400 &&
      exception.statusCode <= 499
    ) {
      httpStatus = exception.statusCode;
      errorMessage = exception.message;
    } else {
      httpStatus = 500;
      errorMessage = [
        'Sorry! something went to wrong on our end, Please try again later',
      ];
    }
    const errorResponse = {
      errors: typeof errorMessage === 'string' ? [errorMessage] : errorMessage,
    };
    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}
