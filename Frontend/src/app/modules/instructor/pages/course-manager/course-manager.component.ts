import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subscription } from 'rxjs';
import { CourseService } from 'src/app/data/services/course.service';
import { QuizService } from 'src/app/data/services/quiz.service';

@Component({
  selector: 'app-course-manager',
  templateUrl: './course-manager.component.html',
  styleUrls: ['./course-manager.component.scss'],
})
export class CourseManagerComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  subscription2!: Subscription;

  courseId: string = this.activatedRoute.snapshot.params['courseId'];

  courseDetails: any;
  enrolledStudents: any[] = [];
  quizzes: any[] = [];

  displayDeleteQuizModal: boolean = false;
  selectedQuizForDeletion: string = '';

  constructor(
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private courseService: CourseService,
    private quizService: QuizService
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
    // get course details from course service
    this.spinner.show();
    this.subscription = this.courseService
      .getCourseDetailsById(this.courseId)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.courseDetails = response?.data;

          this.enrolledStudents = this.courseDetails.enrolledStudents;
          this.quizzes = this.courseDetails.quizzes;

          this.spinner.hide();
          console.log(response);
        },
        error: (err: any) => {
          this.toast.error(err?.error?.message);
          this.spinner.hide();
        },
      });    
  }

  confirmDeleteQuiz(): void {
    if(this.selectedQuizForDeletion===''){
      return;
    }

    this.spinner.show();
    this.subscription2 = this.quizService
      .deleteQuiz(this.selectedQuizForDeletion)      
      .subscribe({
        next: (response: any) => {
          this.toast.success(response?.message);
          this.quizzes = this.quizzes.filter((quiz) => quiz.quizId !== this.selectedQuizForDeletion);
          this.cancelDeleteQuiz();
          this.spinner.hide();
        },
        error: (err: any) => {
          this.toast.error(err?.error?.message);
          this.cancelDeleteQuiz();
          this.spinner.hide();
        }
      });
  }

  selectQuizForDeletion(quizId: string): void {
    this.selectedQuizForDeletion = quizId;
    this.displayDeleteQuizModal = true;
  }

  cancelDeleteQuiz(){
    this.displayDeleteQuizModal = false;
    this.selectedQuizForDeletion = '';
  }

}