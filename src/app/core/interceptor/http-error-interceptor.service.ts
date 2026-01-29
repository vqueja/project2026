import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { HTTP_STATUS } from '../constants/http-errors';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === HTTP_STATUS.UNAUTHORIZED) {
                    // Logic for redirecting to login
                    console.error('User is unauthorized');
                }

                if (error.status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
                    // Show a "Server is down" notification
                }

                return throwError(() => error);
            })
        );
    }
}