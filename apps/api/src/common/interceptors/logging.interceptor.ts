import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;
    const now = Date.now();

    // Sanitize request body to prevent leaking passwords, secrets, or card numbers
    const sanitizedBody = this.sanitize(req.body);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const statusCode = res.statusCode;
          const delay = Date.now() - now;
          this.logger.log(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              method,
              url,
              statusCode,
              durationMs: delay,
              clientIp: ip,
              payload: sanitizedBody,
            }),
          );
        },
        error: (err) => {
          const delay = Date.now() - now;
          this.logger.warn(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              method,
              url,
              statusCode: err.status || 500,
              durationMs: delay,
              error: err.message,
            }),
          );
        },
      }),
    );
  }

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const masked = { ...obj };
    const sensitiveKeys = ['password', 'passwordHash', 'jwtSecret', 'token', 'cardNumber', 'cvv'];
    for (const key of Object.keys(masked)) {
      if (sensitiveKeys.includes(key)) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.sanitize(masked[key]);
      }
    }
    return masked;
  }
}
