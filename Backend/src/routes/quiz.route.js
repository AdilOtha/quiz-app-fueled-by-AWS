const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");

router.get("/getByCourseId/:courseId", quizController.getQuizzesByCourseId);

router.get("/get/:quizId", quizController.getQuizById);

router.post("/create", quizController.addOrEditQuiz);

router.post("/submit", quizController.submitQuiz);

router.delete("/delete/:quizId", quizController.deleteQuiz);

module.exports = router;