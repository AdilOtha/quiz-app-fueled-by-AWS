import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Quiz } from '../interfaces/quiz';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  controllerName: string = '/quiz';

  constructor(private http: HttpClient) { }

  addQuiz(quiz: Quiz) {
    return this.http.post(environment.API_ENDPOINT + this.controllerName+ '/create', {
      quiz: quiz
    });
  }

  getQuizzesByCourseId(courseId: string) {
    return this.http.get(environment.API_ENDPOINT + this.controllerName + '/getByCourseId/' + courseId);
  }

  getQuizById(quizId: string) {
    return this.http.get(environment.API_ENDPOINT + this.controllerName + '/get/' + quizId);
  }

  submitQuiz(quiz: any){
    return this.http.post(environment.API_ENDPOINT + this.controllerName + '/submit', {
      attemptedQuiz: quiz
    });
  }

  deleteQuiz(quizId: string) {
    return this.http.delete(environment.API_ENDPOINT + this.controllerName + '/delete/' + quizId);
  }
}
