const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");

router.get("/getAll", courseController.getCourses);

router.get("/get/:courseId", courseController.getCourseById);

router.get("/getByInstructor", courseController.getCoursesByInstructorId);

router.get("/getDetails/:courseId", courseController.getCourseDetailsById);

router.post("/create", courseController.addCourse);

router.put("/update/:courseId", courseController.updateCourse);

router.put(
  "/addStudentToCourse/:courseId",
  courseController.addStudentToCourse,
);

router.delete("/delete/:courseId", courseController.deleteCourse);

module.exports = router;