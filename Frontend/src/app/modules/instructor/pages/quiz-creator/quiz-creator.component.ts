import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subscription } from 'rxjs';
import { QUESTION_TYPES } from 'src/app/data/constants/questionTypes';
import { QUESTION_TYPES_LIST } from 'src/app/data/constants/questionTypesList';
import { QUIZ_STATUS_LIST } from 'src/app/data/constants/quizStatusList';
import { TRUE_FALSE_OPTIONS } from 'src/app/data/constants/trueFalseOptions';
import { QuestionFormat } from 'src/app/data/interfaces/questionFormat';
import { Quiz } from 'src/app/data/interfaces/quiz';
import { CourseService } from 'src/app/data/services/course.service';
import { QuizService } from 'src/app/data/services/quiz.service';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-quiz-creator',
  templateUrl: './quiz-creator.component.html',
  styleUrls: ['./quiz-creator.component.scss'],
})
export class QuizCreatorComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  subscription2!: Subscription;
  subscription3!: Subscription;

  isEditMode: boolean = false;

  questionTypesList: any[] = [];
  questionTypes: any = QUESTION_TYPES;

  selectedQuestionType: string = QUESTION_TYPES.MULTIPLE_CHOICE;

  trueFalseOptions: any = TRUE_FALSE_OPTIONS;

  quiz!: Quiz;

  // id of quiz to be edited
  quizId: string = this.activatedRoute.snapshot.params['quizId'] || '';

  quizStatusList: any[] = QUIZ_STATUS_LIST;

  quizForm: FormGroup = this.fb.group({
    quizName: ['', Validators.required],
    selectedCourse: ['', Validators.required],
    timeLimit: [5, Validators.required],
    totalMarks: [0, Validators.required],
    quizStatus: [''],
  });
  formSubmitted: boolean = false;

  questionList: any[] = [];

  courses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private quizService: QuizService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private activatedRoute: ActivatedRoute,
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
    this.questionTypesList = QUESTION_TYPES_LIST;
    this.spinner.show();

    this.subscription = this.courseService.getCoursesByInstructor().subscribe({
      next: (response: any) => {
        this.courses = response?.data?.Items;
        console.log(this.courses);

        // check if courses is an array
        if (this.courses instanceof Array) {
          // map each course to object with courseId and courseName
          this.courses = this.courses.map((course) => {
            return {
              courseId: course.courseId,
              courseName: course.courseName,
            };
          });
        } else {
          this.courses = [];
          this.toast.error('Error fetching courses');
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.toast.error(err.error.message);
      },
    });

    // check if quiz is being edited
    if (this.quizId.length > 0) {
      this.isEditMode = true;
      this.subscription2 = this.quizService
        .getQuizById(this.quizId)
        .pipe(
          finalize(() => {
            this.spinner.hide();
          })
        )
        .subscribe({
          next: (response: any) => {
            this.questionList = response.data.quizData;
            this.quizForm.patchValue({
              quizName: response.data.quizName,
              selectedCourse: response.data.courseId,
              timeLimit: response.data.timeLimit,
              totalMarks: response.data.totalMarks,
              quizStatus: response.data.quizStatus,
            });
            this.spinner.hide();
          },
          error: (err) => {
            this.spinner.hide();
            this.toast.error(err?.error?.message || 'Error fetching quiz');
          },
        });
    } else {
      this.spinner.hide();
    }
  }

  get formControl() {
    return this.quizForm.controls;
  }

  addQuestion() {
    console.log(this.quizForm.value);

    const question: QuestionFormat = {
      questionId: uuid(),
      question: '',
      questionType: this.selectedQuestionType,
      options: [],
      answer: '',
      marks: 1,
    };
    this.questionList.push(question);
  }

  submitQuizData() {
    this.formSubmitted = true;
    console.log(this.questionList);
    if (!this.quizForm.valid || this.getTotalMarks() === 0) {
      return;
    }

    this.spinner.show();

    this.quiz = {
      quizName: this.quizForm.value.quizName,
      courseId: this.quizForm.value.selectedCourse,
      quizData: this.questionList,
      timeLimit: this.quizForm.value.timeLimit,
      totalMarks: this.getTotalMarks(),
      quizStatus: this.quizForm.value.quizStatus,
    };

    if (this.isEditMode) {
      this.quiz.quizId = this.quizId;
    }

    this.subscription3 = this.quizService.addQuiz(this.quiz).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.toast.success(response?.message || 'Quiz added successfully');
        this.router.navigate(['/instructor/course/' + this.quiz.courseId]);
      },
      error: (err) => {
        this.spinner.hide();
        this.toast.error(err?.error?.message || 'Error adding quiz');
      },
    });

    console.log(this.quiz);
  }

  getOptions(options: string[]) {
    return options.map((option) => {
      return {
        value: option,
      };
    });
  }

  deleteQuestion(questionId: string) {
    const index = this.questionList.findIndex(
      (question) => question.questionId === questionId
    );
    this.questionList.splice(index, 1);
  }

  getTotalMarks() {
    return this.questionList.reduce((acc, question) => {
      return acc + question.marks;
    }, 0);
  }
}
