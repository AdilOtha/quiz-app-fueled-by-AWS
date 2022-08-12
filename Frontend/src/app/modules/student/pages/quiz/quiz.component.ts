import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { QUESTION_TYPES } from 'src/app/data/constants/questionTypes';
import { AttemptedQuestionFormat } from 'src/app/data/interfaces/attemptedQuestionFormat';
import { AttemptedQuiz } from 'src/app/data/interfaces/attemptedQuiz';
import { QuestionFormat } from 'src/app/data/interfaces/questionFormat';
import { Quiz } from 'src/app/data/interfaces/quiz';
import { QuizService } from 'src/app/data/services/quiz.service';
import { CountdownComponent } from 'ngx-countdown';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  subscription2!: Subscription;
  subscription3!: Subscription;

  questionTypes: any = QUESTION_TYPES;

  quiz!: Quiz;
  questionList: QuestionFormat[] = [];

  attemptedQuestionList!: AttemptedQuestionFormat[];

  @ViewChild('cd', { static: false })
  private countdown!: CountdownComponent;

  config: any = {
    leftTime: 20,
    leftTimeFormat: 'mm:ss',
  }

  constructor(
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe();
    }
    if (this.subscription3) {
      this.subscription3.unsubscribe();
    }
  }

  ngOnInit(): void {
    // get quiz id from url
    this.subscription3 = this.activatedRoute.params.subscribe({
      next: (params: any) => {
        const quizId = params['quizId'];

        // get quiz details from quiz service
        this.spinner.show();
        this.subscription = this.quizService.getQuizById(quizId).subscribe({
          next: (response: any) => {            
            console.log(response);
            this.quiz = response?.data;
            console.log(this.quiz);
            this.questionList = this.quiz?.quizData;            
            this.attemptedQuestionList = this.questionList;
            console.log(this.questionList);
            this.config.leftTime = this.quiz?.timeLimit*60;
            this.countdown?.begin();
            this.spinner.hide();
          },
          error: (err: any) => {
            this.spinner.hide();
            this.toast.error(err?.error?.message);
          },
        });
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toast.error(err?.error?.message);
      },
    });
  }

  // function to submit quiz
  submitQuiz(): void {
    this.spinner.show();
    const attemptedQuiz: AttemptedQuiz = {
      quizId: this.quiz.quizId,
      quizName: this.quiz.quizName,
      attemptedQuestionList: this.attemptedQuestionList,
      courseId: this.quiz.courseId,
      totalMarks: this.quiz.totalMarks,
    };
    this.subscription2 = this.quizService.submitQuiz(attemptedQuiz).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        console.log(response);
        this.toast.success(response?.message);
        this.router.navigate(['/student/enrolled-courses']);
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toast.error(err?.error?.message);
      },
    });
  }

  handleEvent(event: any): void {
    console.log(event);
    if(event.action === 'done'){
      this.submitQuiz();
    }
  }
}
