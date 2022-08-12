import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { StudentService } from 'src/app/data/services/student.service';

@Component({
  selector: 'app-your-courses',
  templateUrl: './your-courses.component.html',
  styleUrls: ['./your-courses.component.scss'],
})
export class YourCoursesComponent implements OnInit, OnDestroy {
  subscription!: Subscription;

  courses: any[] = [];

  constructor(
    private studentService: StudentService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService
  ) {}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.spinner.show();
    this.subscription = this.studentService.getEnrolledCourses().subscribe({
      next: (response: any) => {
        console.log(response);
        this.courses = response?.data?.Items;
        this.spinner.hide();
      },
      error: (error: any) => {
        console.log(error);
        this.spinner.hide();
        if (error?.message) {
          this.toast.error(error?.message);
        }
      },
    });
  }
}
