import { AttemptedQuestionFormat } from "./attemptedQuestionFormat";

export interface AttemptedQuiz {
    quizId?: string;
    quizName: string;
    courseId: string;
    attemptedQuestionList : AttemptedQuestionFormat[];
    totalMarks: number;
}