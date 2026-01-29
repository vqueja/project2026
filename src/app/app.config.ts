import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './core/interceptor/http-error-interceptor.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(
            withInterceptorsFromDi() // Allows use of class-based interceptors
        ),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true // Important: allows multiple interceptors in the chain
        }
    ]
};