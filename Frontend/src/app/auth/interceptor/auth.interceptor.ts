import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // get access token from userDetails$ of authService
    return this.authService.userDetails$.pipe(
      map((userDetails) => {
        if (userDetails) {
          return userDetails?.session?.accessToken?.jwtToken;
        }
      }),
      switchMap((accessToken) => {
        if (accessToken) {
          // add access token to request header
          request = request.clone({
            setHeaders: {
              Authorization: accessToken,
            },
          });
        }
        return next.handle(request);
      })
    );
  }
}
