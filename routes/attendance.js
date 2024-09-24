const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  testAttendanceAPI,
  addAttendance,
  getAttendanceByMonthYear,
  getLatestAttendance,
} = require("../controllers/attendance");
const validateToken = require("../middleware/validateTokenHandler");

//@desc Test Attendance API
//@route GET /api/v1/attendance
//@access Private: Needs Login
router.get("/", validateToken, testAttendanceAPI);

//@desc Test Attendance API
//@route POST /api/v1/attendance/add/:id
//@access Private: Needs Login
router.post(
  "/add/:id",
  validateToken,
  [body("month_year", "Enter a valid month_year").notEmpty()],
  [body("employeeData", "Enter a valid employeeData").notEmpty()],

  addAttendance
);

//@desc Test Attendance API
//@route GET /api/v1/attendance/get/:id
//@access Private: Needs Login
router.post(
  "/get/:id",
  validateToken,
  [body("month_year", "Enter a valid month_year").notEmpty()],

  getAttendanceByMonthYear
);

//@desc Test Attendance API
//@route GET /api/v1/attendance/get/:id
//@access Private: Needs Login
router.get(
  "/get/latest/:id",
  validateToken,

  getLatestAttendance
);

module.exports = router;
