import { QuestionFormat } from "./questionFormat";

export interface AttemptedQuestionFormat extends QuestionFormat {
    attemptedAnswer?: string | string[] | boolean;
    isCorrect?: boolean;
};