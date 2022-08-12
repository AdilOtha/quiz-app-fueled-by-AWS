import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, Subscription } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private toast: ToastrService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.canAuthorizeRoute$.pipe(
      map((isLoadingComplete: any) => {
        console.log('isLoadingComplete', isLoadingComplete);

        if (isLoadingComplete) {
          let isAuthorized = false;
          if (!route.data['role']) {
            this.toast.error(
              'You are not authorized to access this page.',
            );
            this.router.navigate(['/']);
            return false;
          }

          const subscription: Subscription = this.authService.userDetails$.subscribe((userDetails: any) => {
            if (userDetails?.attributes) {
              // get user role
              const userRole = userDetails.attributes.find(
                (attribute: any) => attribute.getName() === 'custom:role'
              );
              console.log('userRole', userRole);

              if (!userRole) {
                this.toast.error(
                  'You are not authorized to access this page.',
                );
                isAuthorized = false;
                this.router.navigate(['/']);
                return;
              }
              const userRoleValue = userRole.getValue();
              // check if user has the required role
              isAuthorized = route.data['role'] === userRoleValue;
            }
          });

          subscription.unsubscribe();

          if (!isAuthorized) {
            this.toast.error(
              'You are not authorized to access this page.',
            );
            this.router.navigate(['/']);
          }

          return isAuthorized;
        } else {
          return false;
        }
      })
    );
  }
}
