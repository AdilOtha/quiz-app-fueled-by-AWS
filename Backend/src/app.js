const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const studentRouter = require("./routes/student.route");
const instructorRouter = require("./routes/instructor.route");
const courseRouter = require("./routes/course.route");
const quizRouter = require("./routes/quiz.route");

const verifyJwt = require("./middleware/auth");

app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// parse form-data
app.use(fileUpload());

// verify JWT token
app.use(verifyJwt);

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.use("/student", studentRouter);
app.use("/instructor", instructorRouter);
app.use("/course", courseRouter);
app.use("/quiz", quizRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

module.exports.handler = serverless(app, {
  request: (req, event, context) => {
    req.event = event;
    req.context = context;
  },
});
