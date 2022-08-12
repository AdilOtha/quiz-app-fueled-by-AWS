const AWS = require("aws-sdk");
const { getSignedImageURLForProfileImage } = require("./student.controller");
// configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});

const ddbClient = new AWS.DynamoDB.DocumentClient();
const SNS = new AWS.SNS({ apiVersion: "2010-03-31" });
const s3Client = new AWS.S3();

const getInstructor = async (req, res) => {
  res.json({ message: "instructor api is working" });
};

const generateReport = async (studentId, courseId) => {
  // get AttemptedQuizzes for student
  const params = {
    TableName: "Students",
    Key: {
      StudentId: studentId,
    },
  };

  try {
    const student = await ddbClient.get(params).promise();
    console.log("student", student);

    let imageURI = null;

    try {
      // check if profile image exists using headObject
      const headObjectParams = {
        Bucket: process.env.S3_BUCKET_STUDENT_PROFILE_IMAGES,
        Key: `${studentId}-profile-image.jpeg`,
      };

      const headObjectRes = await s3Client
        .headObject(headObjectParams)
        .promise();
      console.log("headObjectRes", headObjectRes);

      // get profile image of student from s3 using signed url
      const getSignedUrlParams = {
        Bucket: process.env.S3_BUCKET_STUDENT_PROFILE_IMAGES,
        Key: `${studentId}-profile-image.jpeg`,
        Expires: 60,
      };

      imageURI = await getSignedImageURLForProfileImage(getSignedUrlParams);
    } catch (error) {
      console.log("error", error);
    }

    if (imageURI) {
      student.Item.profileImgUrl = imageURI;
    }

    // get quizIds from AttemptedQuizzes
    const quizIds = student.Item.AttemptedQuizzes;
    console.log("quizIds", quizIds);

    // get quizzes with given courseId from AttemptedQuizzes table using batchGet
    const quizParams = {
      RequestItems: {
        AttemptedQuizzes: {
          Keys: quizIds.map((quizId) => ({
            attemptedQuizId: quizId,
          })),
          FilterExpression: "courseId = :courseId",
          ExpressionAttributeValues: {
            ":courseId": courseId,
          },
        },
      },
    };

    const quizzes = await ddbClient.batchGet(quizParams).promise();
    console.log("quizzes", quizzes);

    if (
      !quizzes.Responses?.AttemptedQuizzes ||
      quizzes.Responses.AttemptedQuizzes.length === 0
    ) {
      student.Item.AttemptedQuizzes = [];
    } else {
      student.Item.AttemptedQuizzes = quizzes.Responses.AttemptedQuizzes;

      // filter quizzes with given courseId
      student.Item.AttemptedQuizzes = student.Item.AttemptedQuizzes.filter(
        (quiz) => quiz.courseId === courseId
      );
    }

    // get course details from Courses table
    const courseParams = {
      TableName: "Courses",
      Key: {
        courseId: courseId,
      },
    };

    const course = await ddbClient.get(courseParams).promise();
    console.log("course", course);

    // get instructor details from Instructors table
    const instructorParams = {
      TableName: "Instructors",
      Key: {
        InstructorId: course.Item.instructorId,
      },
    };

    const instructor = await ddbClient.get(instructorParams).promise();
    console.log("instructor", instructor);

    // add course and instructor details to student
    student.Item.Course = course.Item;

    // add instructor details to student
    student.Item.Instructor = instructor.Item;

    // return student
    return student.Item;
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

// function to send a student report to SNS
const getStudentReport = async (req, res) => {
  const { studentId } = req.params;
  // get courseId from query params
  const { courseId } = req.query;

  try {
    const studentReport = await generateReport(studentId, courseId);

    console.log("studentReport", studentReport);

    // return student
    res.json({
      message: "student report retrieved",
      data: studentReport,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: `Error retrieving the student with id ${studentId}`,
      error,
    });
  }
};

// function to generate and send a student report to SNS
const sendStudentReport = async (req, res) => {
  const { studentId, courseId } = req.body;

  try {
    const studentReport = await generateReport(studentId, courseId);

    console.log("studentReport", studentReport);

    const quizzes = studentReport.AttemptedQuizzes;

    // iterate through quizzes and get quiz details with percentage score
    if (!quizzes || quizzes?.length === 0) {
      return res.json({
        message: "No quizzes found for student",
      });
    }
    quizzes.forEach((quiz) => {
      quiz.percentageScore = Math.round(
        (quiz.obtainedMarks / quiz.totalMarks) * 100
      );
    });

    // generate string with student name, course name and quiz details
    let studentReportString = `${studentReport?.Name}'s performance in the course ${studentReport?.Course?.courseName} with ${quizzes.length} quizzes.\n`;
    quizzes.forEach((quiz) => {
      studentReportString += `Quiz ${quiz?.quizName}: ${quiz?.obtainedMarks} marks out of ${quiz?.totalMarks} with ${quiz?.percentageScore}%.\n`;
    });

    // send student report to SNS
    const snsParams = {
      Message: studentReportString,
      Subject: `Student Report for ${studentReport?.Name}`,
      TopicArn: process.env.SNS_TOPIC_ARN,
      MessageAttributes: {
        userId: {
          DataType: "String",
          StringValue: studentReport.StudentId,
        },
      },
    };

    const snsResponse = await SNS.publish(snsParams).promise();
    console.log("snsResponse", snsResponse);

    // return student
    res.json({
      message: "student report sent",
      data: studentReport,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: `Error generating report for student with id ${studentId}`,
      error,
    });
  }
};

module.exports.getInstructor = getInstructor;
module.exports.getStudentReport = getStudentReport;
module.exports.sendStudentReport = sendStudentReport;
