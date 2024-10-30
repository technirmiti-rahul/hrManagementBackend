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
  const data = matchedData(req); // Contains the validated input data
  const employeeData = data.employeeData;

  console.log("Received data:", data);
  console.log("req.params.id:", req.params.id);

  // If validation errors exist, respond with 400
  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/attendance/add/:id responded with validation errors`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (user) {
    let attendanceRecords = [];
    let errorList = [];

    // Iterate through each employee and save attendance
    for (let i = 0; i < employeeData.length; i++) {
      try {
        const attendance = await Attendance.create({
          client_user_id: req.params.id,
          month_year: data.month_year,
          email: employeeData[i].email,
          name: employeeData[i].name,
          present: employeeData[i].present,
          totalWorkingDays: data.totalWorkingDays,
          month: data.month,
          year: data.year,
          remark: data.remark || "NA",
        });

        logger.info(
          `${ip}: API /api/v1/attendance/add/:id | User: ${user.name} | Attendance added successfully`
        );
        attendanceRecords.push(attendance);
      } catch (err) {
        logger.error(
          `${ip}: API /api/v1/attendance/add/:id | User: ${user.name} | Error: ${err.message}`
        );
        errorList.push({ employee: employeeData[i].name, error: err.message });
      }
    }

    if (errorList.length > 0) {
      return res.status(207).json({
        message: "Some entries failed",
        data: attendanceRecords,
        errors: errorList,
      });
    } else {
      return res.status(201).json({
        message: "All attendance entries added successfully",
        data: attendanceRecords,
      });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/add/:id | Unauthorized user attempt`
    );
    return res.status(401).send({ message: "User is not authorized" });
  }
};

//@desc Create New Attendance
//@route POST /api/v1/attendance/add/single/:client_user_id"
//@access Private: Needs Login
const addSingleAttendance = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const data = matchedData(req); // Contains the validated input data

  console.log("Received data:", data);
  console.log("req.params.id:", req.params.client_user_id);

  // If validation errors exist, respond with 400
  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/attendance/add/:id responded with validation errors`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (user) {
    try {
      const attendance = await Attendance.create({
        client_user_id: req.params.client_user_id,
        month_year: data.month_year,
        email: data.email,
        name: data.name,
        present: data.present,
        totalWorkingDays: data.totalWorkingDays,
        month: data.month,
        year: data.year,
        gross: data.gross,
        remark: data.remark || "NA",
      });

      logger.info(
        `${ip}: API /api/v1/attendance/add/:id | User: ${user.name} | Attendance added successfully`
      );
      return res.status(201).json({
        message: "Attendance added successfully",
        data: attendance,
      });
    } catch (err) {
      logger.error(
        `${ip}: API /api/v1/attendance/add/:id | User: ${user.name} | Error: ${err.message}`
      );
      return res.status(400).json({
        errors: [{ employee: data.name, error: err.message }],
      });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/add/:id | Unauthorized user attempt`
    );
    return res.status(401).send({ message: "User is not authorized" });
  }
};

//@desc Get All Attendance by client_user_id
//@route GET /api/v1/attendance/get/all/:client_user_id
//@access Private: Needs Login
const getAllAttendanceByClient = async (req, res) => {
  const client_user_id = req.params.client_user_id;
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    const attendance = await Attendance.find({
      client_user_id,
    }).sort({ month_year: -1 });
    if (attendance) {
      logger.info(
        `${ip}: API /api/v1/attendance/get/all/:client_user_id | User: ${user.name} | responnded with Success `
      );
      return res.status(200).json(attendance);
    } else {
      logger.error(
        `${ip}: API /api/v1/attendance/get/all/:client_user_id | User: ${user.name} | responnded with Attendance Not Found `
      );
      return res.status(404).json({ message: "Attendance Not Found" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/get/all/:client_user_id | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Get Attendance by  month_year
//@route GET /api/v1/attendance/get/:client_user_id/:month_year
//@access Private: Needs Login
const getAttendanceById = async (req, res) => {
  const data = matchedData(req);

  const client_user_id = req.params.client_user_id;

  const month_year = req.params.month_year;

  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    const attendance = await Attendance.find({
      client_user_id: client_user_id,
      month_year: month_year,
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

//@desc Edit AttendanceData by emp_id
//@route PUT /api/v1/attendance/edit/attendance_id
//@access Private: Needs Login
const editAttendanceData = async (req, res) => {
  const data = matchedData(req); // Extract validated and sanitized data
  const { attendance_id } = req.params; // Extract params from request
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    try {
      // Find the attendance document by its main _id
      const attendance = await Attendance.findOneAndUpdate(
        {
          _id: attendance_id,
        },
        {
          name: data.name,
          present: data.present,
          remark: data.remark,
        }
      );

      if (attendance) {
        logger.info(
          `${ip}: API /api/v1/attendance/edit/:id | User: ${user.name} | responded with Success`
        );
        return res.status(200).json(attendance);
      } else {
        logger.error(
          `${ip}: API /api/v1/attendance/edit/:id | User: ${user.name} | responded with Attendance Not Found`
        );
        return res.status(404).json({ message: "Attendance Not Found" });
      }
    } catch (err) {
      logger.error(
        `${ip}: API /api/v1/attendance/edit/:id | User: ${user.name} | responded with Error: ${err.message}`
      );
      return res.status(500).json({ error: "Error", message: err.message });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/edit/:id | User: ${user.name} | responded with User is not Authorized`
    );
    return res.status(401).send({ message: "User is not Authorized" });
  }
};

//@desc Get AttendanceData by attendanceId and empId
//@route GET /api/v1/attendance/get/employee/:attendance_id
//@access Private: Needs Login
const getEmployeeAttendance = async (req, res) => {
  const { attendance_id } = req.params;
  console.log("attendance_id", attendance_id);
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    try {
      const attendance = await Attendance.findOne({
        _id: attendance_id,
      });

      if (attendance) {
        logger.info(
          `${ip}: API /api/v1/attendance/get/employee/:attendance_id | User: ${user.name} | responded with Success`
        );
        return res.status(200).json(attendance);
      } else {
        logger.error(
          `${ip}: API /api/v1/attendance/get/employee/:attendance_id | User: ${user.name} | responded with Attendance Not Found`
        );
        return res.status(404).json({ message: "Attendance Not Found" });
      }
    } catch (err) {
      logger.error(
        `${ip}: API /api/v1/attendance/get/employee/:attendance_id | User: ${user.name} | responded with Error: ${err.message}`
      );
      return res.status(500).json({ error: "Error", message: err.message });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/get/employee/:attendance_id | User: ${user.name} | responded with User is not Authorized`
    );
    return res.status(401).send({ message: "User is not Authorized" });
  }
};

//@desc Get AttendanceData by from month_year to to month_year and emp_id
//@route GET /api/v1/attendance/get/from/to/:id/:emp_id
//@access Private: Needs Login
const getAttendaceFromTo = async (req, res) => {
  const { id, emp_id } = req.params; // Extract id and emp_id from params
  const data = matchedData(req); // Get the validated input data (from, to)
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    console.log("Client User ID: ", id);
    console.log("Employee ID: ", emp_id);
    console.log("Data: ", data);

    try {
      // Query the Attendance collection
      const attendance = await Attendance.find(
        {
          client_user_id: id, // Match the client_user_id
          month_year: { $gte: data.from, $lte: data.to }, // Filter by date range
          AttendanceData: {
            $elemMatch: { emp_id: emp_id }, // Match only the specific emp_id in AttendanceData
          },
        },
        {
          "AttendanceData.$": 1, // Only return the matched element in AttendanceData array
        }
      ).sort({ month_year: 1 });

      if (attendance && attendance.length > 0) {
        logger.info(
          `${ip}: API /api/v1/attendance/get/from/:from/to/:to/:id/:emp_id | User: ${user.name} | responded with Success`
        );
        return res.status(200).json(attendance);
      } else {
        logger.error(
          `${ip}: API /api/v1/attendance/get/from/:from/to/:to/:id/:emp_id | User: ${user.name} | responded with Attendance Not Found`
        );
        return res.status(404).json({ message: "Attendance Not Found" });
      }
    } catch (err) {
      logger.error(
        `${ip}: API /api/v1/attendance/get/from/:from/to/:to/:id/:emp_id | User: ${user.name} | responded with Error: ${err.message}`
      );
      return res.status(500).json({ error: "Error", message: err.message });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/get/from/:from/to/:to/:id/:emp_id | User: ${user.name} | responded with User is not Authorized`
    );
    return res.status(401).send({ message: "User is not Authorized" });
  }
};

//@desc Get AttendanceData by from month_year to to month_year
//@route GET /api/v1/attendance/get/from/to/::id/:email
//@access Private: Needs Login
const getAttendaceFromTo2 = async (req, res) => {
  const { email } = req.params; // Extract email from params
  const data = matchedData(req); // Get the validated input data (from, to)
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    console.log("Client Email: ", email);
    console.log("Data: ", data);

    try {
      // Query the Attendance collection by email
      const attendance = await Attendance.find({
        email: email, // Match the email
        month_year: { $gte: data.from, $lte: data.to }, // Filter by date range
      }).sort({ month_year: 1 });

      if (attendance && attendance.length > 0) {
        logger.info(
          `${ip}: API /api/v1/attendance/get/from/:from/to/:to/:email | User: ${user.name} | responded with Success`
        );
        return res.status(200).json(attendance);
      } else {
        logger.error(
          `${ip}: API /api/v1/attendance/get/from/:from/to/:to/:email | User: ${user.name} | responded with Attendance Not Found`
        );
        return res.status(404).json({ message: "Attendance Not Found" });
      }
    } catch (err) {
      logger.error(
        `${ip}: API /api/v1/attendance/get/from/:from/to/:to/:email | User: ${user.name} | responded with Error: ${err.message}`
      );
      return res.status(500).json({ error: "Error", message: err.message });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/get/from/:from/to/:to/:email | User: ${user.name} | responded with User is not Authorized`
    );
    return res.status(401).send({ message: "User is not Authorized" });
  }
};

//@desc Add record in AttendanceData
//@route POST /api/v1/attendance/add/record/:id
//@access Private: Needs Login
const addRecordInAttendanceData = async (req, res) => {
  const data = matchedData(req);
  const { id } = req.params;
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    try {
      const attendance = await Attendance.findOne({
        _id: id,
      });
      if (attendance) {
        attendance.AttendanceData.push({
          emp_id: data.emp_id,
          name: data.name,
          present: data.present,
        });
        await attendance.save();
        logger.info(
          `${ip}: API /api/v1/attendance/add/record/:id | User: ${user.name} | responnded with Success `
        );
        return res.status(200).json(attendance);
      } else {
        logger.error(
          `${ip}: API /api/v1/attendance/add/record/:id | User: ${user.name} | responnded with Attendance Not Found `
        );
        return res.status(404).json({ message: "Attendance Not Found" });
      }
    } catch (err) {
      logger.error(
        `${ip}: API /api/v1/attendance/add/record/:id | User: ${user.name} | responnded with Error `
      );
      return res.status(500).json({ error: "Error", message: err.message });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/attendance/add/record/:id | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

module.exports = {
  testAttendanceAPI,
  addAttendance,
  addSingleAttendance,

  getAttendanceById,
  getLatestAttendance,
  editAttendanceData,
  addRecordInAttendanceData,
  getEmployeeAttendance,
  getAllAttendanceByClient,

  getAttendaceFromTo2,
};
