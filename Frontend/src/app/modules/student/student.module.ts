import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { YourCoursesComponent } from './pages/your-courses/your-courses.component';
import { CourseDetailsComponent } from './pages/course-details/course-details.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';


@NgModule({
  declarations: [
    StudentDashboardComponent,
    YourCoursesComponent,
    CourseDetailsComponent,
    QuizComponent,
    UserProfileComponent
  ],
  imports: [
    CommonModule,
    StudentRoutingModule,
    SharedModule
  ]
})
export class StudentModule { }
