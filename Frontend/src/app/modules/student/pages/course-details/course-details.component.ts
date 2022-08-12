import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { QuizService } from 'src/app/data/services/quiz.service';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss'],
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;

  courseId: string = this.activatedRoute.snapshot.params['courseId'];
  courseDetails: any = null;
  activeQuizzes: any = [];
  attemptedQuizzes: any = [];
  allQuizzes: any = [];

  constructor(
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private quizService: QuizService
  ) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    // get course details from course service
    this.spinner.show();
    this.subscription = this.quizService
      .getQuizzesByCourseId(this.courseId)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.courseDetails = response?.data;

          this.allQuizzes = this.courseDetails?.quizzes;

          // remove quizzes with quizStatus = "DRAFT"
          this.allQuizzes = this.allQuizzes?.filter((quiz: any) => {
            return (
              quiz.quizStatus === 'ACTIVE' || quiz.quizStatus === 'COMPLETED'
            );
          });

          // get quizzes with quizStatus property equal to 'ACTIVE'
          this.activeQuizzes =
            this.courseDetails?.quizzes?.filter(
              (quiz: any) => quiz.quizStatus.toUpperCase() === 'ACTIVE'
            ) || [];

          this.attemptedQuizzes = this.courseDetails?.attemptedQuizzes || [];

          // remove attempted quizzes from active quizzes
          this.activeQuizzes = this.activeQuizzes.filter(
            (quiz: any) =>
              !this.attemptedQuizzes.some(
                (attemptedQuiz: any) => attemptedQuiz.quizId === quiz.quizId
              )
          );

          // if attempted quizzes is present in all quizzes, then set quizStatus to 'ATTEMPTED'
          this.allQuizzes.forEach((quiz: any) => {
            if (
              this.attemptedQuizzes.some(
                (attemptedQuiz: any) => attemptedQuiz.quizId === quiz.quizId
              )
            ) {
              quiz.quizStatus = 'ATTEMPTED';
            }
          });

          this.spinner.hide();
        },
        error: (err: any) => {
          console.log(err);
          this.spinner.hide();
          this.toast.error(err.error.message);
        },
      });
  }
}
