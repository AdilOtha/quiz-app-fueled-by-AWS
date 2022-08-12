import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InstructorService {
  controllerName: string = '/instructor';

  constructor(private http: HttpClient) {}

  getStudentReport(studentId: string, courseId: string) {
    // send courseId as a query param
    return this.http.get(
      environment.API_ENDPOINT + this.controllerName + '/getStudentReport/' + studentId,
      {
        params: {
          courseId: courseId,
        },
      }
    );
  }

  sendStudentReport(studentId: string, courseId: string) {
    // send studentId and courseId as request body
    return this.http.post(
      environment.API_ENDPOINT + this.controllerName + '/sendStudentReport',
      {
        studentId: studentId,
        courseId: courseId,
      }      
    );
  }
}
