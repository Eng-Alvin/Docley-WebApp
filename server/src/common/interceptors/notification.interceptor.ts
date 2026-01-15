import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notification } from '../interfaces/notification.interface';

@Injectable()
export class NotificationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const http = context.switchToHttp();
        const request = http.getRequest();
        const response = http.getResponse();

        return next.handle().pipe(
            map((data) => {
                const statusCode = response.statusCode;

                // Automatically add success notification for POST requests (resource creation)
                if (request.method === 'POST' && statusCode === HttpStatus.CREATED) {
                    return {
                        ...data,
                        notification: {
                            code: 'RESOURCE_CREATED',
                            message: 'Resource created successfully.',
                            priority: 'minimal',
                            ttl: 3000,
                        } as Notification,
                    };
                }

                return data;
            }),
        );
    }
}
