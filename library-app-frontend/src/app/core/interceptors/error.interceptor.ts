import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../../shared/services/notification.service';

/** The backend answers errors with an RFC 7807 `ProblemDetail` body. */
interface ProblemDetail {
    title?: string;
    detail?: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const problem = error.error as ProblemDetail | null;
            notificationService.notify(problem?.detail ?? problem?.title ?? error.message);
            return throwError(() => error);
        })
    );
};
