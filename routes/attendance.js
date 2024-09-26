const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  testAttendanceAPI,
  addAttendance,
  getAllAttendanceByClient,
  getAttendanceById,
  getLatestAttendance,
  editAttendanceData,
  addRecordInAttendanceData,
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
//@route GET /api/v1/attendance/get/all/:client_user_id
//@access Private: Needs Login
router.get(
  "/get/all/:client_user_id",
  validateToken,

  getAllAttendanceByClient
);

//@desc Test Attendance API
//@route GET /api/v1/attendance/get/:id
//@access Private: Needs Login
router.get(
  "/get/:id",
  validateToken,

  getAttendanceById
);

//@desc Test Attendance API
//@route GET /api/v1/attendance/get/:id
//@access Private: Needs Login
router.get(
  "/get/latest/:id",
  validateToken,

  getLatestAttendance
);

//@desc Test Attendance API
//@route PUT /api/v1/attendance/edit/:id/:attendance_id
//@access Private: Needs Login
router.put(
  "/edit/:id/:attendance_id",
  validateToken,
  [body("name", "Enter a valid name").notEmpty()],
  [body("present", "Enter a valid present").notEmpty()],
  editAttendanceData
);

//@desc Test Attendance API
//@route POST /api/v1/attendance/add/record/:id
//@access Private: Needs Login
router.post(
  "/add/record/:id",
  validateToken,
  [body("emp_id", "Enter a valid emp_id").notEmpty()],
  [body("present", "Enter a valid present").notEmpty()],
  [body("name", "Enter a valid name").notEmpty()],

  addRecordInAttendanceData
);

module.exports = router;
