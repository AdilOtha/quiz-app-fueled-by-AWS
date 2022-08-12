import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private controllerName: string = '/course';

  constructor(
    private http: HttpClient,    
  ) {}

  getCourses() {
    return this.http.get(
      environment.API_ENDPOINT + this.controllerName + '/getAll'
    );
  }

  getCourseById(courseId: string) {
    return this.http.get(
      environment.API_ENDPOINT + this.controllerName + '/get/' + courseId
    );
  }

  getCourseDetailsById(courseId: string) {
    return this.http.get(
      environment.API_ENDPOINT + this.controllerName + '/getDetails/' + courseId
    );
  }

  getCoursesByInstructor() {
    return this.http.get(
      environment.API_ENDPOINT + this.controllerName + '/getByInstructor'
    );
  }

  updateCourse(courseId: string, updateCourseForm: FormGroup) {
    return this.http.put(
      environment.API_ENDPOINT + this.controllerName + '/update/' + courseId,
      updateCourseForm.value
    );
  }

  createCourse(createCourseForm: FormGroup) {
    return this.http.post(
      environment.API_ENDPOINT + this.controllerName + '/create',
      createCourseForm.value
    );
  }

  deleteCourse(courseId: string) {
    return this.http.delete(
      environment.API_ENDPOINT + this.controllerName + '/delete/' + courseId
    );
  }  
}
