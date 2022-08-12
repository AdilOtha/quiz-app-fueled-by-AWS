import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/auth/role.guard';
import { CourseManagerComponent } from './pages/course-manager/course-manager.component';
import { InstructorDashboardComponent } from './pages/instructor-dashboard/instructor-dashboard.component';
import { QuizCreatorComponent } from './pages/quiz-creator/quiz-creator.component';
import { StudentReportComponent } from './pages/student-report/student-report.component';

const routes: Routes = [
  {
    path: '',
    component: InstructorDashboardComponent,    
    canActivate: [RoleGuard],
    data: {
      role: 'instructor',
    },
  },  
  {
    path: 'quiz-creator/:quizId',
    component: QuizCreatorComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'instructor',
    },
  },
  {
    path: 'quiz-creator',
    component: QuizCreatorComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'instructor',
    },
  },
  {
    path: 'course/:courseId',
    component: CourseManagerComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'instructor',
    },    
  },
  {
    path: 'student-report/:studentId',
    component: StudentReportComponent,
    canActivate: [RoleGuard],
    data: {
      role: 'instructor',
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstructorRoutingModule {}
