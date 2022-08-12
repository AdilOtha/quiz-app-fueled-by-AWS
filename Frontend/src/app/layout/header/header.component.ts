import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  userDetailsSubscription!: Subscription;

  items: MenuItem[] = [];
  avatarMenuItems: MenuItem[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.userDetailsSubscription = this.authService.userDetails$.subscribe({
      next: (userDetails: any) => {
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
          // depending on the user role, show different menu items
          if (userRoleValue === 'instructor') {
            this.items = [
              {
                label: 'Dashboard',
                icon: 'fa fa-tachometer-alt',
                routerLink: ['/instructor'],
              },
              {
                label: 'Quiz Creator',
                icon: 'fa fa-question-circle',
                routerLink: ['/instructor/quiz-creator'],
              },
            ];
            this.avatarMenuItems = [
              // {
              //   label: 'Profile',
              //   routerLink: '/user-profile',
              //   icon: 'pi pi-user',
              // },
              {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: (event) => {
                  this.authService.logout();
                },
              },
            ];
          } else {
            this.items = [
              {
                label: 'Dashboard',
                icon: 'fa fa-tachometer-alt',
                routerLink: ['/student'],
              },
              {
                label: 'Your Courses',
                icon: 'fa fa-book',
                routerLink: ['/student/enrolled-courses'],
              },
            ];
            this.avatarMenuItems = [
              {
                label: 'Profile',
                routerLink: ['/student/profile'],
                icon: 'pi pi-user',
              },
              {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: (event) => {
                  this.authService.logout();
                },
              },
            ];
          }
          this.items = [...this.items];
        }
      },
    });
  }
}
