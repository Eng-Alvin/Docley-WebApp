import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Notification } from '../interfaces/notification.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message, statusCode: status };

    // Detailed logging for 500 errors or specific unexpected errors
    if (status >= 500) {
      this.logger.error(
        `--- ERROR DETECTED ---
URL: ${request.method} ${request.url}
STATUS: ${status}
TIMESTAMP: ${new Date().toISOString()}
MESSAGE: ${JSON.stringify(message)}
STACK TRACE:
${exception.stack || 'No stack trace available'}
-----------------------`,
      );
    } else {
      // Log other errors at a lower level
      this.logger.warn(
        `[${status}] ${request.method} ${request.url} - ${JSON.stringify(message)}`,
      );
    }

    const responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    };

    // Extract notification if it exists in the message object
    if (typeof message === 'object' && (message as any).notification) {
      responseBody.notification = (message as any).notification;
    }

    response.status(status).json(responseBody);
  }
}
