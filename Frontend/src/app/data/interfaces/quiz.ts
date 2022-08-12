import { QuestionFormat } from "./questionFormat";

export interface Quiz {
    quizId?: string;
    quizName: string;
    courseId: string;
    quizData: QuestionFormat[];
    timeLimit: number;
    totalMarks: number;
    quizStatus: string;
}