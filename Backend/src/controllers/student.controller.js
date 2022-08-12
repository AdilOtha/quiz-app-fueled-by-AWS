const AWS = require("aws-sdk");
const { addStudentToCourse } = require("./course.controller");

// configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});

const db = new AWS.DynamoDB();
const ddbClient = new AWS.DynamoDB.DocumentClient();
const s3Client = new AWS.S3();

// fetch student
const fetchStudentFromTable = async (studentId, tableName) => {
  console.log("Fetching StudentId", studentId);

  try {
    const getItemParams = {
      TableName: tableName,
      Key: {
        [tableName === "Users" ? "UserId" : "StudentId"]: { S: studentId },
      },
    };

    console.log(
      `Getting from table ${tableName === "Users" ? "UserId" : "StudentId"}`
    );

    const getItemRes = await db.getItem(getItemParams).promise();
    console.log("getItemRes", getItemRes);

    const student = getItemRes.Item;

    return student;
  } catch (error) {
    console.log(
      `Error getting from table ${
        tableName === "Users" ? "UserId" : "StudentId"
      }`
    );
    throw error;
  }
};

//  get a single student from the Users db
const getStudentFromUsers = async (req, res) => {
  const { studentId } = req.params;
  console.log("StudentId", studentId);

  try {
    const student = await fetchStudentFromTable(studentId, "Users");

    console.log("getItem for student with id:", studentId, student);

    res.json({
      student: student,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving the student with id ${studentId}`,
      error,
    });
  }
};

const getSignedImageURLForProfileImage = async (bucketParams) => {
  const gotUri = await new Promise((resolve, reject) => {
    s3Client.getSignedUrl("getObject", bucketParams, (err, urlOfObject) => {
      if (err) reject(err);
      console.log("urll", urlOfObject);
      resolve(urlOfObject);
    });
  });

  return gotUri;
};

//  get a single student from the Students db
const getStudentFromStudents = async (req, res) => {
  const studentId = req.params?.studentId || req?.user?.sub;
  console.log("StudentId", studentId);

  try {
    const student = await fetchStudentFromTable(studentId, "Students");
    let imageURI = null;

    console.log("getItem for student with id:", studentId, student);

    // get profile image of student from s3 using signed url
    const getSignedUrlParams = {
      Bucket: process.env.S3_BUCKET_STUDENT_PROFILE_IMAGES,
      Key: `${studentId}-profile-image.jpeg`,
      Expires: 60,
    };

    // check if profile image exists using headObject
    const headObjectParams = {
      Bucket: process.env.S3_BUCKET_STUDENT_PROFILE_IMAGES,
      Key: `${studentId}-profile-image.jpeg`,
    };

    try {
      const headObjectRes = await s3Client
        .headObject(headObjectParams)
        .promise();
      console.log("headObjectRes", headObjectRes);

      imageURI = await getSignedImageURLForProfileImage(getSignedUrlParams);
    } catch (error) {
      console.log("error", error);
    }

    if (imageURI) {
      student.profileImgUrl = imageURI;
    }
    res.json({
      student: student,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving the student with id ${studentId}`,
      error,
    });
  }
};

// get list of students by ids from dynamo db
const getStudentsByIds = async (studentIds) => {
  try {
    if (!studentIds || studentIds.length === 0) {
      resolve([]);
    }
    const getStudentParams = {
      RequestItems: {
        Students: {
          Keys: studentIds.map((studentId) => ({
            StudentId: { S: studentId },
          })),
        },
      },
    };

    console.log("getStudentParams", getStudentParams);

    const getStudentRes = await db.batchGetItem(getStudentParams).promise();

    console.log("getStudentRes", getStudentRes);

    const students = getStudentRes.Responses.Students.map((student) => {
      return student;
    });

    return students;
  } catch (error) {
    console.log("Error getting students by ids", error);
    throw error;
  }
};

// get this from users table
const getProfileStatus = async (req, res) => {
  const { studentId } = req.params;
  console.log("StudentId", studentId);

  try {
    const student = await fetchStudentFromTable(studentId, "Users");

    console.log("getItem for student with id:", studentId, student);

    res.json({
      isProfileComplete: student.IsProfileComplete.BOOL,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving the student with id ${studentId}`,
      error,
    });
  }
};

const updateProfile = async (req, res) => {
  const studentId = req?.user?.sub;

  const profileImageToUpload = req.body?.image;
  let { profile: userInfo } = req.body;
  userInfo = JSON.parse(userInfo);

  console.log("profileImageToUpload", profileImageToUpload);
  console.log("userInfo", userInfo);

  const updateStudentInfo = {
    TableName: "Students",
    Key: {
      StudentId: studentId,
    },
    UpdateExpression:
      "set #studentName = :studentName, Email = :Email, PhoneNumber = :PhoneNumber",
    ExpressionAttributeValues: {
      ":studentName": userInfo.Name,
      ":Email": userInfo.Email,
      ":PhoneNumber": userInfo.PhoneNumber,
    },
    ExpressionAttributeNames: {
      "#studentName": "Name",
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    if (profileImageToUpload) {
      const buffer = Buffer.from(
        profileImageToUpload.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const putToS3Bucket = {
        Bucket: process.env.S3_BUCKET_STUDENT_PROFILE_IMAGES,
        Key: `${studentId}-profile-image.jpeg`,
        Body: buffer,
        ContentEncoding: "base64",
        ContentType: "image/jpeg",
      };

      const putResponse = await s3Client.putObject(putToS3Bucket).promise();
      console.log(putResponse);
    }

    const updateResponse = await ddbClient.update(updateStudentInfo).promise();
    res.json({
      message: "profile updated successfully!",
      data: updateResponse,
    });
  } catch (err) {
    console.log(err);
    res.json({ message: err.message });
  }
};

const subscribeCourse = async (req, res) => {
  const studentId = req?.user?.sub;
  const { courseId } = req.body;

  if (!studentId || !courseId) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }

  try {
    // Get the old student data
    const student = await fetchStudentFromTable(studentId, "Students");

    console.log("getItem for student with id:", studentId, student);

    // check if the student is already subscribed to the course
    if (student?.CoursesEnrolled.L.find((course) => course.S === courseId)) {
      return res.json({
        message: "Already enrolled to this course",
      });
    }

    student.CoursesEnrolled.L.push({
      S: courseId,
    });

    //  Update the student data
    const putItemParams = {
      TableName: "Students",
      Item: {
        ...student,
      },
    };

    // Put the item in the DB
    const putItemRes = await db.putItem(putItemParams).promise();
    console.log("Student updated::", putItemRes);

    if (putItemRes) {
      let resP = null;
      try {
        resP = await addStudentToCourse(studentId, courseId);
      } catch (error) {
        console.log(error);
      }

      if (resP) {
        res.json({
          message: "Student successfully enrolled to course",
        });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: `Error adding course for the student with id ${studentId}`,
      error,
    });
  }
};

const giveQuizAddQuizAttempted = (req, res) => {
  console.log(req, req);
  res.json({ message: "Called giveQuizAddQuizAttempted()" });
};

const viewAttemptedQuizzes = (req, res) => {
  console.log(req, req);
  res.json({ message: "Called viewAttemptedQuizzes()" });
};

const sendMarksToParents = (req, res) => {
  console.log(req, req);
  res.json({ message: "Called sendMarksToParents()" });
};

const getEnrolledCourses = async (req, res) => {
  console.log("Calling getEnrolledCourses()");
  const studentId = req?.user?.sub;

  if (!studentId) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  // get CoursesEnrolled from Students table
  try {
    const student = await fetchStudentFromTable(studentId, "Students");

    console.log("getItem for student with id:", studentId, student);

    const courseIds = student.CoursesEnrolled.L.map((course) => course.S);

    console.log("courseIds", courseIds);

    if (!courseIds || courseIds.length === 0) {
      return res.json({
        enrolledCourses: [],
      });
    }

    // get Courses from Courses table using the courseIds and dynamo batchGetItem
    const getCourseParams = {
      RequestItems: {
        Courses: {
          Keys: courseIds.map((courseId) => ({
            courseId: { S: courseId },
          })),
        },
      },
    };

    const getCourseRes = await db.batchGetItem(getCourseParams).promise();

    console.log("enrolledCourses", getCourseRes);

    const courses = {};
    courses.Items = getCourseRes.Responses.Courses.map((course) => {
      return course;
    });

    res.json({
      data: courses,
      message: "Successfully retrieved enrolled courses",
    });
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving the student with id ${studentId}`,
      error,
    });
  }
};

module.exports.getStudentFromUsers = getStudentFromUsers;
module.exports.getStudentFromStudents = getStudentFromStudents;
module.exports.getStudentsByIds = getStudentsByIds;
module.exports.getProfileStatus = getProfileStatus;
module.exports.updateProfile = updateProfile;
module.exports.subscribeCourse = subscribeCourse;
module.exports.giveQuizAddQuizAttempted = giveQuizAddQuizAttempted;
module.exports.viewAttemptedQuizzes = viewAttemptedQuizzes;
module.exports.sendMarksToParents = sendMarksToParents;
module.exports.getEnrolledCourses = getEnrolledCourses;
module.exports.getSignedImageURLForProfileImage = getSignedImageURLForProfileImage;
