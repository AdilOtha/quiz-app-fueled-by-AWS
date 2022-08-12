export interface QuestionFormat {
    questionId: string;
    question: string;
    questionType: string;
    options: string[];
    answer: string | string[] | boolean;
    marks? : number;
};