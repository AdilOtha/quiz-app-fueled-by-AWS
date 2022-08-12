import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { NonAuthGuard } from './auth/non-auth.guard';
import { RoleGuard } from './auth/role.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'instructor',
        loadChildren: () => import('./modules/instructor/instructor.module').then(m => m.InstructorModule),        
      },
      {
        path: 'student',
        loadChildren: () => import('./modules/student/student.module').then(m => m.StudentModule),
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
    canActivate: [NonAuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
