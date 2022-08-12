const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructor.controller");

router.get("/", instructorController.getInstructor);

router.get("/getStudentReport/:studentId", instructorController.getStudentReport);

router.post("/sendStudentReport", instructorController.sendStudentReport);

module.exports = router;