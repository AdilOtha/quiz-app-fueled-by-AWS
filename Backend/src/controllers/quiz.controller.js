const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const QUESTION_TYPES = require("../constants/questionTypes");

// configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
});

const ddbClient = new AWS.DynamoDB.DocumentClient();

// function to add a new quiz to dynamodb
const addOrEditQuiz = async (req, res) => {
  const { quiz } = req.body;

  let isEditMode = false;

  if (quiz?.quizId) {
    isEditMode = true;
  } else {
    quiz.quizId = uuidv4();
  }

  const createdAt = new Date().toISOString();
  quiz.createdAt = createdAt;

  // save quiz to dynamodb
  const params = {
    TableName: "Quizzes",
    Item: quiz,
  };
  try {
    await ddbClient.put(params).promise();
    res.json({
      message: `${
        isEditMode ? "Quiz updated successfully" : "Quiz added successfully"
      }`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding quiz", error });
  }
};

// function to delete a quiz by id
const deleteQuiz = async (req, res) => {
  const { quizId } = req.params;

  const params = {
    TableName: "Quizzes",
    Key: {
      quizId: quizId,
    },
  };

  try {
    await ddbClient.delete(params).promise();
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting quiz", error });
  }
};

// function to return a course by id and its quizzes
const getQuizzesByCourseId = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req?.user?.sub;
  const params = {
    TableName: "Quizzes",
    FilterExpression: "courseId = :courseId",
    ExpressionAttributeValues: {
      ":courseId": courseId,
    },
  };
  try {
    const quizzes = await ddbClient.scan(params).promise();

    // get course by id from dynamodb
    const courseParams = {
      TableName: "Courses",
      Key: {
        courseId: courseId,
      },
    };
    const courseData = await ddbClient.get(courseParams).promise();
    const course = courseData.Item;
    course.quizzes = quizzes.Items;

    // get student's attempted quizzes
    const studentParams = {
      TableName: "Students",
      Key: {
        StudentId: studentId,
      },
    };

    const studentData = await ddbClient.get(studentParams).promise();

    // iterate over AttemptedQuizzes and get details
    const attemptedQuizIds = studentData.Item?.AttemptedQuizzes;

    if (attemptedQuizIds && attemptedQuizIds?.length > 0) {
      // get all attempted quizzes from dynamodb using batchGet
      const batchGetParams = {
        RequestItems: {
          AttemptedQuizzes: {
            Keys: attemptedQuizIds.map((quizId) => ({
              attemptedQuizId: quizId,
            })),
          },
        },
      };

      const batchGetData = await ddbClient.batchGet(batchGetParams).promise();

      // filter attemptedquizzes based on given courseId
      const attemptedQuizzes = batchGetData.Responses.AttemptedQuizzes.filter(
        (quiz) => quiz.courseId === courseId
      );

      // add attempted quizzes to course
      course.attemptedQuizzes = attemptedQuizzes;

    } else {
      course.attemptedQuizzes = [];
    }

    res.json({ message: "Course retrieved successfully", data: course });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving course quizzes", error });
  }
};

// function to return a quiz by id
const getQuizById = async (req, res) => {
  const { quizId } = req.params;
  const params = {
    TableName: "Quizzes",
    Key: {
      quizId: quizId,
    },
  };
  try {
    const data = await ddbClient.get(params).promise();
    res.json({ message: "Quiz retrieved successfully", data: data.Item });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving quiz", error });
  }
};

const evaluateQuiz = (attemptedQuestionList) => {
  attemptedQuestionList.forEach((question) => {
    switch (question.questionType) {
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        question.isCorrect = question.answer === question.attemptedAnswer;
        break;
      case QUESTION_TYPES.TRUE_FALSE:
        question.isCorrect = question.answer === question.attemptedAnswer;
        break;
      case QUESTION_TYPES.MULTI_SELECT:
        // check if both arrays exactly match
        if (
          question.answer instanceof Array &&
          question.attemptedAnswer instanceof Array
        ) {
          question.isCorrect =
            question.answer.length === question.attemptedAnswer.length &&
            question.answer.every((element, index) => {
              return element === question.attemptedAnswer[index];
            });
        } else {
          question.isCorrect = false;
        }
        break;
      default:
        question.isCorrect = false;
        break;
    }
  });
  return attemptedQuestionList;
};

// function to calculate score of a quiz
const calculateScore = (attemptedQuestionList) => {
  let obtainedMarks = 0;
  attemptedQuestionList.forEach((question) => {
    if (question.isCorrect) {
      obtainedMarks += question.marks;
    }
  });
  return obtainedMarks;
};

// function to submit a quiz
const submitQuiz = async (req, res) => {
  const studentId = req?.user?.sub;
  const { attemptedQuiz } = req.body;

  attemptedQuiz.attemptedQuestionList = evaluateQuiz(
    attemptedQuiz.attemptedQuestionList
  );
  attemptedQuiz.obtainedMarks = calculateScore(
    attemptedQuiz.attemptedQuestionList
  );

  attemptedQuiz.attemptedQuizId = uuidv4();

  // save quiz to dynamodb table AttemptedQuizzes
  const params = {
    TableName: "AttemptedQuizzes",
    Item: attemptedQuiz,
  };

  try {
    await ddbClient.put(params).promise();

    // add attemptedQuizId to student's attemptedQuizzes
    const studentParams = {
      TableName: "Students",
      Key: {
        StudentId: studentId,
      },
      UpdateExpression:
        "set AttemptedQuizzes = list_append(AttemptedQuizzes, :attemptedQuizId)",
      ExpressionAttributeValues: {
        ":attemptedQuizId": [attemptedQuiz.attemptedQuizId],
      },
      ReturnValues: "UPDATED_NEW",
    };
    await ddbClient.update(studentParams).promise();
    res.json({ message: "Quiz submitted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error submitting quiz", error });
  }
};

module.exports.addOrEditQuiz = addOrEditQuiz;
module.exports.getQuizzesByCourseId = getQuizzesByCourseId;
module.exports.getQuizById = getQuizById;
module.exports.submitQuiz = submitQuiz;
module.exports.deleteQuiz = deleteQuiz;
