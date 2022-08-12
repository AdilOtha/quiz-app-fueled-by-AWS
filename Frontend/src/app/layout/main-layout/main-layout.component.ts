import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  showHeader: boolean = true;

  userDetails: any = null;
  userDetailsSubscription!: Subscription;

  constructor(
    private toast: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide progress spinner or progress bar
        this.showHeader = event.url !== '/login';
        console.log('header', this.showHeader);
      }
    });
  }  

  ngOnInit(): void {    
    this.userDetailsSubscription = this.authService.userDetails$.subscribe((userDetails: any) => {
      if (userDetails?.attributes) {
        // get user role
        const userRole = userDetails.attributes.find(
          (attribute: any) => attribute.getName() === 'custom:role'
        );
        console.log('userRole', userRole);

        if (!userRole) {
          return;
        }
        const userRoleValue = userRole.getValue();
        const currentRoute = this.router.url;

        if(userRoleValue === 'student') {
          // check if current route contains 'student'
          if(!currentRoute.includes('student')) {
            this.router.navigate(['/student']);
          }
        } else if(userRoleValue === 'instructor') {
          // check if current route contains 'instructor'
          if(!currentRoute.includes('instructor')) {
            this.router.navigate(['/instructor']);
          }
        } else {
          this.router.navigate([`/${userRoleValue}`]);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.userDetailsSubscription.unsubscribe();
  }

}
