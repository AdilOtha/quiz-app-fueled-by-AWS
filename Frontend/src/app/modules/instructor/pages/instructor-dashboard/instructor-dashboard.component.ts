import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subscription } from 'rxjs';
import { CourseService } from 'src/app/data/services/course.service';

@Component({
  selector: 'app-instructor-dashboard',
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.scss'],
})
export class InstructorDashboardComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  subscription2!: Subscription;
  subscription3!: Subscription;
  subscription4!: Subscription;
  subscription5!: Subscription;

  courses: any[] = [];

  displayModal: boolean = false;
  displayDeleteModal: boolean = false;

  formSubmitted: boolean = false;

  courseForm: FormGroup = this.fb.group({
    courseName: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  selectedCourse: any = {};
  selectedCourseId: string = '';

  constructor(
    private courseService: CourseService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toast: ToastrService
  ) {}

  get formControl() {
    return this.courseForm.controls;
  }

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
    if (this.subscription4) {
      this.subscription4.unsubscribe();
    }
    if (this.subscription5) {
      this.subscription5.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.spinner.show();
    this.subscription = this.courseService
      .getCoursesByInstructor()
      .subscribe({
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

  selectCourse(courseId: string) {
    this.spinner.show();
    this.subscription2 = this.courseService
      .getCourseById(courseId)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.selectedCourse = response?.data?.Item;
          this.formControl['courseName'].setValue(
            this.selectedCourse?.courseName
          );
          this.formControl['description'].setValue(
            this.selectedCourse?.description
          );
          this.spinner.hide();
        },
        error: (error: any) => {
          console.log(error);
          this.spinner.hide();
        },
      });
    this.displayModal = true;
  }

  selectCourseForDeletion(courseId: string) {
    this.selectedCourseId = courseId;
    this.displayDeleteModal = true;
  }

  confirmDeleteCourse(){
    if(this.selectedCourseId.length > 0){
      this.spinner.show();
      this.subscription3 = this.courseService
        .deleteCourse(this.selectedCourseId)
        .subscribe({
          next: (response: any) => {
            console.log(response);            

            // find the course in the array and remove it
            const index = this.courses.findIndex(
              (course: any) =>
                course.courseId === this.selectedCourseId
            );
            console.log(index);

            this.courses.splice(index, 1);
            this.selectedCourseId = '';
            this.displayDeleteModal = false;
            this.spinner.hide();
            this.toast.success('Course deleted successfully');
          },
          error: (error: any) => {
            console.log(error);
            this.selectedCourseId = '';
            this.displayDeleteModal = false;
            this.spinner.hide();
            this.toast.error('Error deleting course');
          }
        });
    }
  }

  submitUpdateCourseForm() {
    this.formSubmitted = true;

    if (this.courseForm.invalid) {
      return;
    }

    if (this.selectedCourse?.courseId) {
      console.log(this.courseForm.value);

      this.spinner.show();
      this.subscription4 = this.courseService
        .updateCourse(this.selectedCourse?.courseId, this.courseForm)
        .subscribe({
          next: (response: any) => {
            console.log(response);

            // find the course in the array and update it
            const index = this.courses.findIndex(
              (course: any) =>
                course.courseId === response?.data?.Attributes?.courseId
            );
            console.log(index);

            this.courses[index] = response?.data?.Attributes;
            this.spinner.hide();
            this.toast.success('Course updated successfully');
          },
          error: (error: any) => {
            console.log(error);
            this.spinner.hide();
            this.toast.error('Error updating course');
          },
        });
      this.cancelUpdateCourse();
    } else {
      console.log(this.courseForm.value);
      this.spinner.show();
      this.subscription5 = this.courseService
        .createCourse(this.courseForm)
        .subscribe({
          next: (response: any) => {
            console.log(response);
            this.courses.push(response?.data?.Item);
            this.spinner.hide();
            this.toast.success('Course created successfully');
          },
          error: (error: any) => {
            console.log(error);
            this.spinner.hide();
            this.toast.error('Error creating course');
          }
        });
      this.cancelUpdateCourse();
    }
  }

  cancelUpdateCourse() {
    this.displayModal = false;
    this.displayDeleteModal = false;
    this.formSubmitted = false;
    this.courseForm.reset();
    this.selectedCourse = {};
    this.selectedCourseId = '';
  }
}
