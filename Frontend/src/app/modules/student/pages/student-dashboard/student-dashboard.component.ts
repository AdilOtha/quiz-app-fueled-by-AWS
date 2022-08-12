import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CourseService } from 'src/app/data/services/course.service';
import { StudentService } from 'src/app/data/services/student.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  subscription2!: Subscription;

  courses: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private courseService: CourseService,
    private studentService: StudentService
  ) {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.spinner.show();
    this.subscription = this.courseService.getCourses().subscribe({
      next: (response: any) => {
        console.log(response);
        this.courses = response?.data?.Items;
        this.spinner.hide();
      },
      error: (error: any) => {
        console.log(error);
        this.spinner.hide();
      },
    });
  }

  enrollCourse(courseId: string) {
    this.spinner.show();
    this.subscription2 = this.studentService.enrollCourse(courseId).subscribe({
      next: (response: any) => {
        console.log(response);
        this.toast.success(response?.message);
        this.spinner.hide();
      },
      error: (error: any) => {
        console.log(error);
        this.spinner.hide();
        this.toast.error(error?.message);
      },
    });
  }
}
