const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");

router.get("/getEnrolledCourses", studentController.getEnrolledCourses);

router.get("/getProfile", studentController.getStudentFromStudents);

//  To update the entry in the "Students" table
router.post("/updateProfile", studentController.updateProfile);

// Add the courseId to the coursesEnrolled array in the student entry and add the studentId in the enrolledStudents array in the course
router.post("/subscribeCourse", studentController.subscribeCourse);


module.exports = router;
