const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const cors = require("cors");
const { Error } = require("./models/errorModel");
const { User } = require("./models/user.model");
const { OPTION } = require("./models/optionModel");
require("dotenv/config");
var http = require("http");
const { REQUEST } = require("./models/requestModel");
const server = http.createServer(app);
const xl = require("excel4node");
const wb = new xl.Workbook();
const ws = wb.addWorksheet("Worksheet Name");
const moment = require("moment");
const { Meal } = require("./models/meal.model");
var csv = require("csvtojson");
let dates = [];
let distinctCourses = [];
let totalCourses = [];
let occurrences = "";
let studentsCourse = [];

const multer = require("multer");
const { STUDENTCOURSE } = require("./models/studentModel");
const { DATES } = require("./models/dates");
const { ADVISOR } = require("./models/teacherModel");
const studentStorage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `students.csv`);
  },
});

const advisorStorage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `advisors.csv`);
  },
});

const studentupload = multer({ storage: studentStorage });
const advisorupload = multer({ storage: advisorStorage });

const api = process.env.API_URL;
const ENV = process.env;

app.use(cors());
app.options("*", cors());

//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

app.post(
  "/file/student",

  studentupload.single("file"),
  async (req, res, next) => {
    let courses = await STUDENTCOURSE.find();
    let dbdates = await DATES.find();
    if (courses.length) {
      res.status(500).json({
        error: "Please clean database befor uploading new file",
        success: false,
      });
    } else {
      const file = req.file;
      if (!file) {
        const error = new Error("No File");
        error.httpStatusCode = 400;
        return next(error);
      }
      await parseStudentCsv();

      res.send(file);
    }
  }
);

async function parseStudentCsv() {
  csv()
    .fromFile("./uploads/students.csv")
    .then(function (jsonArrayObj) {
      jsonArrayObj.forEach((student) => {
        console.log(student)
        var nameArr = student.courses.split(",");
        if (!nameArr.includes("")) {
          if (nameArr.length > 0) {
            const newStd = new STUDENTCOURSE({
              courses: nameArr,
              roll: student.roll,
            });
            newStd.save();
          }
        }
      });
    });
}

app.post("/login", async (req, res) => {
  var user = await User.findOne({ email: req.body.email });
  if (user && user.password === req.body.password) {
    res.status(201).json(user);
  } else {
    res.status(500).json({
      error: "Wrong email or password",
      success: false,
    });
  }
});

app.post("/request", async (req, res) => {
  const body = req.body
  var request = await STUDENTCOURSE.findOne({ "roll": body.roll })
  if(request) {
    res.status(500).json({
      error: 'Already request placed',
      success: false
  })
  } else {
    let courses = body.courses
    const newRequest = new STUDENTCOURSE({
      courses: courses,
      roll:body.roll,
      isApproved:false
    });

    await newRequest.save();
    res.status(200).json('created')
  }
    
});


app.get("/courses", async (req, res) => {
  const filter = { "isApproved":true };
  let courses = await STUDENTCOURSE.find();
  courses = courses.filter(course => course.isApproved == true);
  // if(courses.length<1){
  //   res.status(500).json({
  //     error: "NOT_FOUND",
  //     success: false,
  //   });
  // }
  let dbdates = await DATES.find();
  if (dbdates.length && courses.length) {
    dates = dbdates[0].dates;
    studentsCourse = courses;
    if (courses.length) {
      let formattedData = formatCourses(courses);
      res.status(201).json(formattedData);
    } else {
      res.status(500).json({
        error: "NOT_FOUND",
        success: false,
      });
    }
  } else {
    res.status(500).json({
      error: "NOT_FOUND",
      success: false,
    });
  }
});

app.get("/requests", async (req, res) => {
  let courses = await STUDENTCOURSE.find();
  res.status(201).json(courses);
});

app.post('/update/request', async (req, res) => {
  const filter = { "_id": req.body.id };
  const update = { isApproved: req.body.isApproved };
  let doc = await STUDENTCOURSE.findOneAndUpdate(filter, update, {
      returnOriginal: false
  });
  res.status(201).json('ok')
})

app.post("/create/dates", async (req, res) => {
  let dbdates = await DATES.find();
  if (dbdates.length) {
    res.status(500).json({
      error: "Please clean database befor adding dates",
      success: false,
    });
  } else {
    const body = req.body;
    let dates = [body.date1, body.date2, body.date3];
    body.date4 ? dates.push(body.date4) : "";
    body.date5 ? dates.push(body.date5) : "";
    const newDates = new DATES({
      dates: dates,
    });
    await newDates.save();
    res.status(200).json("created");
  }
});

app.delete("/delete", async (req, res) => {
  // let r = await STUDENTCOURSE.remove({});
  let y = await DATES.remove({});
  res.status(201).json("deleted");
});

app.post('/signup', async (req, res) => {
  var user = await User.findOne({ "email": req.body.email })
  if (!user) {
      const user = new User({
          email: req.body.email,
          password: req.body.password,
          role: 'appuser'
      })
      user.save().then((createdError => {
          res.status(201).json(createdError)
      })).catch((err) => {
          res.status(500).json({
              error: err,
              success: false
          })
      })
  }
  else {
      res.status(500).json({
          error: 'Email already exists',
          success: false
      })
  }


})

function formatCourses(studentCourses) {
  studentCourses.forEach((c) => {
    const courses = c.courses;
    courses.forEach((course) => {
      const index = distinctCourses.indexOf(course);
      if (index < 0) {
        distinctCourses.push(course);
      }
      totalCourses.push(course);
    });
  });

  occurrences = totalCourses.reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
  }, {});
  console.log("occurances", occurrences);

  let tableModel = [];
  let sortedCourses = getSortedCourse();
  dates.forEach((date, index) => {
    let coursesOnTheDate = findCourses(sortedCourses, index);
    let obj = {
      date: date,
      courses: coursesOnTheDate,
      students: findStudents(coursesOnTheDate),
    };
    tableModel.push(obj);
  });
  return tableModel;
}

function findStudents(coursesOnTheDate) {
  let courses = coursesOnTheDate.split(",");
  let students = "";
  courses.forEach((course) => {
    studentsCourse.forEach((student) => {
      if (student.courses.includes(course)) {
        students += student.roll + ",";
      }
    });
  });
  return students.substring(0, students.length - 1);
}

function getSortedCourse() {
  let sortable = [];
  for (var course in occurrences) {
    sortable.push([course, occurrences[course]]);
  }

  sortable.sort(function (a, b) {
    return a[1] - b[1];
  });
  let sortedCourse = [];
  sortable.forEach((s) => {
    sortedCourse.push(s[0]);
  });
  sortedCourse.reverse();
  return formatCoursesToSchedue(sortedCourse);
}

function formatCoursesToSchedue(courses) {
  let len = dates.length;
  let filtered = [];
  let isReverse = false;
  while (len < courses.length) {
    if (isReverse) {
      courses.reverse();
    }
    let course = courses.slice(0, len);
    filtered.push(course);
    courses.splice(0, len);
    isReverse = !isReverse;
  }

  filtered.push(courses);
  return filtered;
}

function findCourses(allCourses, index) {
  let coursesOnTheDay = "";
  allCourses.forEach((courses) => {
    if (courses[index]) {
      coursesOnTheDay += courses[index] + ",";
    }
  });
  return coursesOnTheDay.substring(0, coursesOnTheDay.length - 1);
}

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "eshop-database",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

server.listen(ENV.PORT, () => {
  console.log("server is running http://localhost:80");
});
