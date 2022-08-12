import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { InstructorService } from 'src/app/data/services/instructor.service';

@Component({
  selector: 'app-student-report',
  templateUrl: './student-report.component.html',
  styleUrls: ['./student-report.component.scss'],
})
export class StudentReportComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  subscription2!: Subscription;

  studentId = this.activatedRoute.snapshot.params['studentId'];
  courseId = this.activatedRoute.snapshot.queryParams['courseId'];

  studentDetails: any;
  profileImage: any;
  attemptedQuizzes: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private instructorService: InstructorService
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
    this.subscription = this.instructorService
      .getStudentReport(this.studentId, this.courseId)
      .subscribe({
        next: (response: any) => {
          console.log(response?.data);

          this.studentDetails = response?.data;
          
          if(this.studentDetails?.profileImgUrl) {
            this.profileImage = this.studentDetails?.profileImgUrl;
          }

          this.attemptedQuizzes = this.studentDetails?.AttemptedQuizzes;

          this.spinner.hide();
        },
        error: (err) => {
          this.toast.error(err?.error?.message);
          console.log(err);
          this.spinner.hide();
        },
      });
  }

  sendReport() {
    this.spinner.show();
    this.subscription2 = this.instructorService
      .sendStudentReport(this.studentId, this.courseId)
      .subscribe({
        next: (response: any) => {
          this.toast.success(response?.message);
          this.spinner.hide();
        },
        error: (err) => {
          this.toast.error(err?.error?.message);
          console.log(err);
          this.spinner.hide();
        }
      });
  }
}
