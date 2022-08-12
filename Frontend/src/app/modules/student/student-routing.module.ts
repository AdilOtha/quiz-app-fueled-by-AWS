import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/auth/role.guard';
import { CourseDetailsComponent } from './pages/course-details/course-details.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { YourCoursesComponent } from './pages/your-courses/your-courses.component';

const routes: Routes = [
  {
    path: '',
    component: StudentDashboardComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'student',
    },
  },
  {
    path: 'enrolled-courses',
    component: YourCoursesComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'student',
    },
  },
  {
    path: 'course-details/:courseId',
    component: CourseDetailsComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'student',
    },
  },
  {
    path: 'quiz/:quizId',
    component: QuizComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'student',
    },
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'student',
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
