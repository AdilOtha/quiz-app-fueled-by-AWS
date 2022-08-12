const studentController = require("./student.controller");
const quizController = require("./quiz.controller");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});

const ddbClient = new AWS.DynamoDB.DocumentClient();

// function to add a new course
const addCourse = async (req, res) => {
  const { courseName, description } = req.body;
  const instructorId = req?.user?.sub;
  const courseId = uuidv4();
  const createdAt = new Date().toISOString();
  //  TODO:  credits: credits,
  const params = {
    TableName: "Courses",
    Item: {
      courseId: courseId,
      courseName: courseName,
      description: description,
      instructorId: instructorId,
      createdAt: createdAt,
      enrolledStudents: [],
    },
  };
  try {
    await ddbClient.put(params).promise();
    const data = {
      Item: {
        courseId,
        courseName,
        description,
        instructorId,
        createdAt,
      },
    };
    res.json({ message: "Course added successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Error adding course", error });
  }
};

// function to get all courses
const getCourses = async (req, res) => {
  const params = {
    TableName: "Courses",
  };
  try {
    const data = await ddbClient.scan(params).promise();
    res.json({ message: "Courses retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses", error });
  }
};

// function to get a course by id: basic info such as name and description
const getCourseById = async (req, res) => {
  const { courseId } = req.params;
  const params = {
    TableName: "Courses",
    Key: {
      courseId: courseId,
    },
  };
  try {
    const data = await ddbClient.get(params).promise();    

    res.json({ message: "Course retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error });
  }
};

// function to get course details by id: course name, description, enrolled students info, quizzes
const getCourseDetailsById = async (req, res) => {
  const { courseId } = req.params;
  const params = {
    TableName: "Courses",
    Key: {
      courseId: courseId,
    },
  };

  try {
    const courseData = await ddbClient.get(params).promise();

    if (!courseData.Item) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    let enrolledStudents = [];

    if (courseData?.Item?.enrolledStudents.length > 0) {
      // get enrolled students
      enrolledStudents = await studentController.getStudentsByIds(
        courseData.Item.enrolledStudents
      );
    }

    // iterate over quizzes and get quiz details
    const quizParams = {
      TableName: "Quizzes",
      FilterExpression: "courseId = :courseId",
      ExpressionAttributeValues: {
        ":courseId": courseId,
      },
    };
    const quizzes = await ddbClient.scan(quizParams).promise();
    console.log("Quizzes:",quizzes);
    courseData.Item.quizzes = quizzes.Items;

    courseData.Item.enrolledStudents = enrolledStudents;
    res.json({
      message: "Course retrieved successfully",
      data: courseData.Item,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error });
  }
};

// function to get courses by instructor id
const getCoursesByInstructorId = async (req, res) => {
  const instructorId = req?.user?.sub;
  const params = {
    TableName: "Courses",
    FilterExpression: "instructorId = :instructorId",
    ExpressionAttributeValues: {
      ":instructorId": instructorId,
    },
  };
  try {
    const data = await ddbClient.scan(params).promise();
    res.json({ message: "Courses retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses", error });
  }
};

// function to update a course
const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { courseName, description } = req.body;
  const instructorId = req?.user?.sub;
  const params = {
    TableName: "Courses",
    Key: {
      courseId: courseId,
    },
    UpdateExpression:
      "set courseName = :courseName, description = :description, instructorId = :instructorId",
    ExpressionAttributeValues: {
      ":courseName": courseName,
      ":description": description,
      ":instructorId": instructorId,
    },
    ReturnValues: "ALL_NEW",
  };
  try {
    const data = await ddbClient.update(params).promise();
    res.json({ message: "Course updated successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};

// function to subscribe a student to the course
const addStudentToCourse = (studentId, courseId) => {
  return new Promise(async (resolve, reject) => {
    const params = {
      TableName: "Courses",
      Key: {
        courseId: courseId,
      },
      UpdateExpression: "set #attrName = list_append(#attrName, :attrValue)",
      ExpressionAttributeNames: {
        "#attrName": "enrolledStudents",
      },
      ExpressionAttributeValues: {
        ":attrValue": [studentId],
      },
      ReturnValues: "ALL_NEW",
    };
    try {
      const data = await ddbClient.update(params).promise();
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

// function to delete a course
const deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  const params = {
    TableName: "Courses",
    Key: {
      courseId: courseId,
    },
  };
  try {
    const data = await ddbClient.delete(params).promise();
    res.json({ message: "Course deleted successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
};

module.exports.addCourse = addCourse;
module.exports.getCourses = getCourses;
module.exports.getCourseById = getCourseById;
module.exports.getCoursesByInstructorId = getCoursesByInstructorId;
module.exports.updateCourse = updateCourse;
module.exports.addStudentToCourse = addStudentToCourse;
module.exports.deleteCourse = deleteCourse;
module.exports.getCourseDetailsById = getCourseDetailsById;
