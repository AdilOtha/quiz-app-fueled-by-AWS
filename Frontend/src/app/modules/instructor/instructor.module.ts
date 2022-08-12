import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstructorRoutingModule } from './instructor-routing.module';
import { InstructorDashboardComponent } from './pages/instructor-dashboard/instructor-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { QuizCreatorComponent } from './pages/quiz-creator/quiz-creator.component';
import { CourseManagerComponent } from './pages/course-manager/course-manager.component';
import { StudentReportComponent } from './pages/student-report/student-report.component';


@NgModule({
  declarations: [
    InstructorDashboardComponent,
    QuizCreatorComponent,
    CourseManagerComponent,
    StudentReportComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    InstructorRoutingModule
  ]
})
export class InstructorModule { }
