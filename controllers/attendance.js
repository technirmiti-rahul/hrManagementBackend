const { validationResult, matchedData } = require("express-validator");
const logger = require("../config/logger.js");
const Attendance = require("../models/Attendance.js");

//@desc Test Attendance API
//@route GET /api/v1/attendance
//@access Private: Needs Login
const testAttendanceAPI = async (req, res) => {
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    logger.info(
      `${ip}: API /api/v1/attendance | User: ${user.name} | responnded with Attendance Api Successful `
    );
    return res
      .status(200)
      .send({ data: user, message: "Attendance Api Successful" });
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Create New Attendance
//@route POST /api/v1/attendance/add/:id
//@access Private: Needs Login
const addAttendance = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const data = matchedData(req);
  console.log("data", data);

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/attendance/add/:id responnded with Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (user) {
    const oldAttendance = await Attendance.findOne({
      client_user_id: req.params.id,
      month_year: data.month_year,
    });
    if (oldAttendance) {
      console.log("oldAttendance", oldAttendance);
      oldAttendance.AttendanceData = data.employeeData;
      oldAttendance.month_year = data.month_year;
      await Attendance.findOneAndUpdate(
        {
          client_user_id: req.params.id,
          month_year: data.month_year,
        },
        {
          AttendanceData: data.employeeData,
        },
        { new: true }
      );
      logger.info(
        `${ip}: API /api/v1/attendance/add/:id | User: ${user.name} | responnded with Success `
      );
      return res.status(201).json(oldAttendance);
    }

    await Attendance.create({
      client_user_id: req.params.id,
      AttendanceData: data.employeeData,
      month_year: data.month_year,
    })
      .then((attendance) => {
        logger.info(
          `${ip}: API /api/v1/attendance/add/:id | User: ${user.name} | responnded with Success `
        );
        return res.status(201).json(attendance);
      })
      .catch((err) => {
        logger.error(
          `${ip}: API /api/v1/attendance/add/:id | User: ${user.name} | responnded with Error `
        );
        return res.status(500).json({ error: "Error", message: err.message });
      });
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/add/:id | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Get Attendance by  month_year
//@route GET /api/v1/attendance/get/:id
//@access Private: Needs Login
const getAttendanceByMonthYear = async (req, res) => {
  const data = matchedData(req);
  console.log("data", data);
  const client_user_id = req.params.id;
  const month_year = data.month_year;
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    const attendance = await Attendance.findOne({
      client_user_id,
      month_year,
    });
    if (attendance) {
      logger.info(
        `${ip}: API /api/v1/attendance/get/:client_user_id/:month_year | User: ${user.name} | responnded with Success `
      );
      return res.status(200).json(attendance);
    } else {
      logger.error(
        `${ip}: API /api/v1/attendance/get/:client_user_id/:month_year | User: ${user.name} | responnded with Attendance Not Found `
      );
      return res.status(404).json({ message: "Attendance Not Found" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/get/:client_user_id/:month_year | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Get Latest Attendance by client_user_id
//@route GET /api/v1/attendance/get/latest/:id
//@access Private: Needs Login
const getLatestAttendance = async (req, res) => {
  const client_user_id = req.params.id;
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    try {
      const attendance = await Attendance.findOne({
        client_user_id,
      }).sort({ month_year: -1, createDate: -1 });
      if (attendance) {
        logger.info(
          `${ip}: API /api/v1/attendance/get/latest/:client_user_id | User: ${user.name} | responnded with Success `
        );
        console.log("attendance", attendance);
        return res.status(200).json(attendance);
      } else {
        logger.error(
          `${ip}: API /api/v1/attendance/get/latest/:client_user_id | User: ${user.name} | responnded with Attendance Not Found `
        );
        return res.status(404).json({ message: "Attendance Not Found" });
      }
    } catch (err) {
      logger.error(
        `${ip}: API /api/v1/attendance/get/latest/:client_user_id | User: ${user.name} | responnded with Error `
      );
      return res.status(500).json({ error: "Error", message: err.message });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/get/latest/:client_user_id | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

module.exports = {
  testAttendanceAPI,
  addAttendance,
  getAttendanceByMonthYear,
  getLatestAttendance,
};
