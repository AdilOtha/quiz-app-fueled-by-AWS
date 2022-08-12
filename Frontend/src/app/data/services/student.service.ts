import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  controllerName: string = '/student';

  constructor(private http: HttpClient) { }

  enrollCourse(courseId: string) {
    return this.http.post(
      environment.API_ENDPOINT + this.controllerName + '/subscribeCourse',
      {courseId: courseId}
    );
  }

  getEnrolledCourses() {
    return this.http.get(
      environment.API_ENDPOINT + this.controllerName + '/getEnrolledCourses'
    );
  }

  getProfile() {
    return this.http.get(
      environment.API_ENDPOINT + this.controllerName + '/getProfile'
    );
  }

  updateProfile(profile: any, image?: any) {
    // send image as form data
    const formData = new FormData();
    formData.append('profile', JSON.stringify(profile));
    if (image) {
      formData.append('image', image);
    }
    return this.http.post(
      environment.API_ENDPOINT + this.controllerName + '/updateProfile',
      formData
    );
  }
}