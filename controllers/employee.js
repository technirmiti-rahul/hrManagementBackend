const jwt = require("jsonwebtoken");

const dotenv = require("dotenv").config();
const { validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Client = require("../models/Client");
const Employee = require("../models/Employee");
const Role = require("../models/Role");
const logger = require("../config/logger.js");

const secret = process.env.ACCESS_TOKEN_SECERT;
const defaultPassword = process.env.DEFAULT_PASSWORD;
//@desc Test Employee API
//@route GET /api/v1/employee
//@access Private: Needs Login
const testEmployeeAPI = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;

  if (user) {
    logger.info(
      `${ip}: API /api/v1/employee | User:  ${user.name}| responnded with "Employee API Test Successfully" `
    );
    return res.status(200).send("Employee API Test Successfully");
  } else {
    logger.error(
      `${ip}: API /api/v1/employee | User: ${user.name} | responnded with Employee is not Autherized `
    );
    return res.status(401).send({ message: "Employee is not Autherized" });
  }
};

//@desc Create New Employee
//@route POST /api/v1/employee/add
//@access Private: Needs Login
const createEmployee = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const data = matchedData(req);
  console.log("data", data);

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/employee/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with Employee is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  try {
    const existingUser = await User.findOne({ adhar_card: data.adhar_card });
    if (existingUser) {
      logger.error(
        `${ip}: API /api/v1/employee/add | User: ${user.name} | Responded with Employee already registered! for email: ${data.email}`
      );
      return res.status(409).json({ message: "User already registered!" });
    }

    var existingEmployee = await Employee.findOne({ email: data.email });
    if (existingEmployee) {
      logger.error(
        `${ip}: API /api/v1/employee/add | User: ${user.name} | Responded with Employee already registered! for user: ${data.email}`
      );
      return res.status(409).json({ message: "Employee already registered!" });
    }

    var existingEmployee = await Employee.findOne({
      adhar_card: data.adhar_card,
    });
    if (existingEmployee) {
      logger.error(
        `${ip}: API /api/v1/employee/add | User: ${user.name} | Responded with Employee already registered! for user: ${data.email}`
      );
      return res.status(409).json({ message: "Employee already registered!" });
    }

    const existingClient = await Client.findOne({
      user_id: data.client_user_id,
    });

    const salt = await bcrypt.genSalt(10);
    let securedPass = "";
    if (data.password) {
      securedPass = await bcrypt.hash(data.password, salt);
    } else {
      securedPass = await bcrypt.hash("111111", salt);
    }

    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: securedPass,
      whatsapp_no: data.whatsapp_no,
      city: data.city,
      adhar_card: data.adhar_card,
      address: data.address,
      country: data.country,
      state: data.state,
      pin_code: data.pin_code,
      team: data.team,
      roleType: data.roleType,
      department: data.department,
    });

    const newEmployee = await Employee.create({
      user_id: newUser._id,
      client_id: existingClient._id || data.client_id,
      client_user_id: data.client_user_id,

      name: data.name,
      email: data.email,
      whatsapp_no: data.whatsapp_no,
      designation: data.designation,

      date_of_joining: data.date_of_joining,
      address: data.address,
      city: data.city,
      country: data.country,
      state: data.state,
      pin_code: data.pin_code,

      adhar_card: data.adhar_card,
      uan_no: data.uan_no,
      pf_no: data.pf_no,
      esic_no: data.esic_no,
      bank_name: data.bank_name,
      bank_ac_no: data.bank_ac_no,
      bank_ifsc: data.bank_ifsc,

      pf_basic: data.pf_basic,
      basic: data.basic,
      da: data.da,
      hra: data.hra,
      food_allow: data.food_allow,
      conveyance: data.conveyance,
      epf: data.epf,
      esic: data.esic,
      lwf: data.lwf,
      e_epf: data.e_epf,
      e_esic: data.e_esic,
    });

    console.log("newEmployee", newEmployee);

    logger.info(
      `${ip}: API /api/v1/employee/add | User: ${newUser.name} | Responded with Success`
    );
    return res.status(201).json(newUser);
  } catch (err) {
    logger.error(
      `${ip}: API /api/v1/employee/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    console.log(err);
    return res.status(500).json({ error: "Error", message: err.message });
  }
};

//@desc Create New Employee
//@route POST /api/v1/employee/add
//@access Private: Needs Login
const createEmployeesByExcel = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const data = matchedData(req);
  console.log("data", data);

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/employee/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with Employee is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  const role = await Role.findOne({ name: "employee" });

  let existingUsers = [];
  let newUsers = [];
  let Errors = [];
  for (let i in data.employeeData) {
    const existingUser = await User.findOne({
      adhar_card: data.employeeData[i].adhar_card,
    });

    const existingEmployee = await Employee.findOne({
      adhar_card: data.employeeData[i].adhar_card,
    });

    if (existingUser || existingEmployee) {
      logger.error(
        `${ip}: API /api/v1/employee/add | User: ${user.name} | Responded with Employee already registered! for email: ${data.email}`
      );
      existingUsers.push(data.employeeData[i]);
    } else {
      try {
        const existingClient = await Client.findOne({
          user_id: data.client_user_id,
        });

        const salt = await bcrypt.genSalt(10);
        let securedPass = "";
        if (data.employeeData[i].password) {
          securedPass = await bcrypt.hash(data.password, salt);
        } else {
          securedPass = await bcrypt.hash("111111", salt);
        }

        const newUser = await User.create({
          name: data.employeeData[i].name,
          email: data.employeeData[i].email,
          password: securedPass,
          whatsapp_no: data.employeeData[i].whatsapp_no,
          adhar_card: data.employeeData[i].adhar_card,
          city: data.employeeData[i].city,
          address: data.employeeData[i].address,
          country: data.employeeData[i].country,
          state: data.employeeData[i].state,
          pin_code: data.employeeData[i].pin_code,
          team: data.team,
          roleType: role._id,
          department: data.department,
        });

        const newEmployee = await Employee.create({
          user_id: newUser._id,
          client_id: existingClient._id || data.client_id,
          client_user_id: data.client_user_id,
          name: data.employeeData[i].name,
          email: data.employeeData[i].email,
          whatsapp_no: data.employeeData[i].whatsapp_no,
          city: data.employeeData[i].city,
          designation: data.employeeData[i].designation,

          date_of_joining: data.employeeData[i].date_of_joining,
          address: data.employeeData[i].address,
          country: data.employeeData[i].country,
          state: data.employeeData[i].state,
          pin_code: data.employeeData[i].pin_code,

          adhar_card: data.employeeData[i].adhar_card,
          uan_no: data.employeeData[i].uan_no || "",
          pf_no: data.employeeData[i].pf_no || "",
          esic_no: data.employeeData[i].esic_no || "",
          bank_name: data.employeeData[i].bank_name || "",
          bank_ac_no: data.employeeData[i].bank_ac_no || "",
          bank_ifsc: data.employeeData[i].bank_ifsc || "",
          pf_basic: data.employeeData[i].pf_basic || "",
          basic: data.employeeData[i].basic || "",
          da: data.employeeData[i].da || "",
          hra: data.employeeData[i].hra || "",
          food_allow: data.employeeData[i].food_allow || "",
          conveyance: data.employeeData[i].conveyance || "",
          epf: data.employeeData[i].epf || "",
          esic: data.employeeData[i].esic || "",
          lwf: data.employeeData[i].lwf || "",
          e_epf: data.employeeData[i].e_epf || "",
          e_esic: data.employeeData[i].e_esic || "",
        });

        console.log("newEmployee", newEmployee);

        logger.info(
          `${ip}: API /api/v1/employee/add | User: ${newUser.name} | Responded with Success`
        );
        newUsers.push(newEmployee);
      } catch (err) {
        logger.error(
          `${ip}: API /api/v1/employee/add | User: ${
            user?.name || "Guest"
          } | Responded with Error`
        );
        console.log(err);
        Errors.push(err.message);
      }
    }
  }

  return res.status(201).json({ existingUsers, newUsers, Errors });
};

//@desc Update Newly Created Employee
//@route POST /api/v1/employee/update/created
//@access Private: Needs Login
const updateCreatedEmployee = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const data = matchedData(req);
  console.log("data", data);

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/employee/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with Employee is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  try {
    const newUser = await User.findOneAndUpdate(
      { _id: data.user_id },
      {
        name: data.name,

        password: data.password,
        whatsapp_no: data.whatsapp_no,
        city: data.city,
        address: data.address,
        country: data.country,
        state: data.state,
        pin_code: data.pin_code,
        team: data.team,
        roleType: data.roleType,
        department: data.department,
      }
    );

    const newEmployee = await Employee.findOneAndUpdate(
      { user_id: data.user_id },
      {
        name: data.name,
        email: data.email,
        whatsapp_no: data.whatsapp_no,
        city: data.city,
        designation: data.designation,

        date_of_joining: data.date_of_joining,
        address: data.address,
        country: data.country,
        state: data.state,
        pin_code: data.pin_code,
      },
      {
        new: true,
      }
    );

    console.log("newEmployee", newEmployee);

    logger.info(
      `${ip}: API /api/v1/employee/add | User: ${newUser.name} | Responded with Success`
    );
    return res.status(201).json(newUser);
  } catch (err) {
    logger.error(
      `${ip}: API /api/v1/employee/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    console.log(err);
    return res.status(500).json({ error: "Error", message: err.message });
  }
};
//@desc Add Client Details
//@route PUT /api/v1/client/add/details/:id
//@access Private: Needs Login
const AddClientDetails = async (req, res) => {
  const user = req.user;
  const id = req.params.id;
  const data = matchedData(req);

  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/add/details/:${id} | User: ${
        user?.name || "Guest"
      } | Responded with Validation Error`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/client/add/details/:${id} | User: ${user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  try {
    const client = await Client.findOneAndUpdate(
      { user_id: id },
      {
        pan_card: data.pan_card,
        adhar_card: data.adhar_card,
        gst_no: data.gst_no,
        cin_no: data.cin_no,
        industry_type: data.industry_type,
        employee_count_range: data.employee_count_range,
        incorporation_type: data.incorporation_type,
        contact_person: {
          name: data.contact_person.name,
          email: data.contact_person.email,
          contact_no: data.contact_person.contact_no,
          designation: data.contact_person.designation,
        },
      },
      {
        new: true,
      }
    );

    if (!client) {
      logger.error(
        `${ip}: API /api/v1/client/add/details/:${id} | User: ${user.name} | Responded with Client Not Found `
      );
      return res.status(404).json({ message: "Client Not Found" });
    }

    logger.info(
      `${ip}: API /api/v1/client/add/details/:${id} | User: ${user.name} | Responded with Success`
    );
    return res.status(200).json(client);
  } catch (err) {
    logger.error(
      `${ip}: API /api/v1/client/add/details/:${id} | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    return res.status(500).json({ error: "Error", message: err.message });
  }
};

//@desc Get all Employees
//@route GET /api/v1/employee/getall/:client_id
//@access Private: Needs Login
const getClientEmployees = async (req, res) => {
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const client_id = req.params.client_id;
  console.log("client_id", client_id);

  try {
    if (user) {
      let employees = await Employee.find({
        client_id: client_id,
        active: true,
      });

      if (employees.length <= 0) {
        employees = await Employee.find({
          client_user_id: client_id,
          active: true,
        });
      }

      console.log("employees", employees);

      logger.info(
        `${ip}: API /api/v1/employee/getall | User: ${user.name} | responnded with Success `
      );
      return await res.status(200).json({
        data: employees,
        message: "employees retrived successfully",
      });
    } else {
      logger.error(
        `${ip}: API /api/v1/employee/getall | User: ${user.name} | responnded with Client is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/employee/getall | User: ${user.name} | responnded with Error `
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Get all Employees
//@route GET /api/v1/employee/getall
//@access Private: Needs Login
const getAllEmployees = async (req, res) => {
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (user && user.roleType.name === "super_admin") {
      console.log("user: ", user);

      const employees = await Employee.find({ active: true });

      logger.info(
        `${ip}: API /api/v1/employee/getall | User: ${user.name} | responnded with Success `
      );
      return res
        .status(200)
        .json({ data: employees, message: "employees retrived successfully" });
    } else {
      logger.error(
        `${ip}: API /api/v1/employee/getall | User: ${user.name} | responnded with Client is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/employee/getall | User: ${user.name} | responnded with Error `
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Get Employee with id
//@route GET /api/v1/employee/get/:id
//@access Private: Needs Login
const getEmployee = async (req, res) => {
  const loggedin_user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const { id } = req.params;

  try {
    if (loggedin_user) {
      let employee = await Employee.findOne({
        _id: id,
      });

      if (!employee || employee.length <= 0) {
        employee = await Employee.findOne({
          user_id: id,
        });
      }

      if (employee) {
        logger.info(
          `${ip}: API /api/v1/employee/get/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return await res.status(200).json({
          data: employee,
          message: "Employee retrived successfully",
        });
      } else {
        logger.info(
          `${ip}: API /api/v1/employee/get/:${id} | User: ${loggedin_user.name} | responnded Empty i.e. Employee was not found `
        );
        return await res.status(200).json({
          message: "Employee Not Found",
        });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/employee/get/:${id} | User: ${loggedin_user.name} | responnded with Employee is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/employee/get/:id | User: ${loggedin_user.name} | responnded with Error `
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Get Employee by email
//@route GET /api/v1/employee/get/by/email/:email
//@access Private: Needs Login
const getEmployeeByEmail = async (req, res) => {
  const loggedin_user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const { email } = req.params;

  try {
    if (loggedin_user) {
      let employee = await Employee.findOne({
        email,
      });

      if (employee) {
        logger.info(
          `${ip}: API /api/v1/employee/getbyemail/:${email} | User: ${loggedin_user.name} | responnded with Success `
        );
        return await res.status(200).json({
          data: employee,
          message: "Employee retrived successfully",
        });
      } else {
        logger.info(
          `${ip}: API /api/v1/employee/getbyemail/:${email} | User: ${loggedin_user.name} | responnded Empty i.e. Employee was not found `
        );
        return await res.status(200).json({
          message: "Employee Not Found",
        });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/employee/getbyemail/:${email} | User: ${loggedin_user.name} | responnded with Employee is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/employee/getbyemail/:email | User: ${loggedin_user.name} | responnded with Error `
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//@desc Update Employee with id
//@route PUT /api/v1/employee/update/:user_id
//@access Private: Needs Login
const updateEmployee = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;

  const data = matchedData(req);
  console.log("data: ", data);

  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/employee/update/:${id} | User: ${loggedin_user.name} | responnded with Validation Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (loggedin_user) {
    try {
      const oldUser = await Employee.findOne({ user_id: id });
      if (oldUser) {
        const result = await Employee.findOneAndUpdate(
          { user_id: id },
          {
            name: data.name,
            whatsapp_no: data.whatsapp_no,
            city: data.city,
            designation: data.designation,
            address: data.address,
            country: data.country,
            state: data.state,
            pin_code: data.pin_code,

            uan_no: data.uan_no,
            pf_no: data.pf_no,
            esic_no: data.esic_no,
            bank_name: data.bank_name,
            bank_ac_no: data.bank_ac_no,
            bank_ifsc: data.bank_ifsc,
            pf_basic: data.pf_basic,
            basic: data.basic,
            da: data.da,
            hra: data.hra,
            food_allow: data.food_allow,
            conveyance: data.conveyance,
            epf: data.epf,
            esic: data.esic,
            lwf: data.lwf,
            e_epf: data.e_epf,
            e_esic: data.e_esic,

            updated_at: Date.now(),
          },
          {
            new: true,
          }
        );

        const user = await User.findOneAndUpdate(
          { _id: id },
          {
            name: data.name,
            whatsapp_no: data.whatsapp_no,
            city: data.city,
            address: data.address,
            country: data.country,
            state: data.state,
            pin_code: data.pin_code,
          }
        );

        logger.info(
          `${ip}: API /api/v1/employee/update/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res
          .status(200)
          .json({ data: result, message: "Employee Updated Successfully" });
      } else {
        logger.info(
          `${ip}: API /api/v1/employee/update/:${id} | User: ${loggedin_user.name} | responnded with Employee Not Found `
        );
        return res.status(200).json({ message: "Employee Not Found" });
      }
    } catch (error) {
      logger.error(
        `${ip}: API /api/v1/employee/update/:${id} | User: ${loggedin_user.name} | responnded with Error `
      );
      return res
        .status(500)
        .json({ data: error, message: "Something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/employee/update/:${id} | User: ${loggedin_user.name} | responnded with Employee is not Autherized `
    );
    return res.status(401).send({ message: "Employee is not Autherized" });
  }
};

//@desc Delete Employee with id (we are updating active to false )
//@route PUT /api/v1/employee/delete/:id
//@access Private: Needs Login
const deleteEmployee = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (loggedin_user) {
      const updated = {
        active: false,
      };
      const oldUser = await Employee.findOne({ user_id: id });
      if (oldUser) {
        console.log("oldUser: ", oldUser);
        const employeeRes = await Employee.findOneAndUpdate(
          { user_id: id },
          updated,
          {
            new: true,
          }
        );

        const userRes = await User.findOneAndUpdate({ _id: id }, updated, {
          new: true,
        });

        logger.info(
          `${ip}: API /api/v1/employee/delete/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res
          .status(200)
          .json({ data: employeeRes, message: "User Deleted Successfully" });
      } else {
        logger.info(
          `${ip}: API /api/v1/employee/delete/:${id} | User: ${loggedin_user.name} | responnded with Employee Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/employee/delete/:${id} | User: ${loggedin_user.name} | responnded with Employee is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/employee/delete/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

//@desc Update Employee approved with id (we are updating active to false )
//@route PUT /api/v1/employee/app_dis/:id
//@access Private: Needs Login
const AppDisEmployee = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (loggedin_user) {
      const oldUser = await Employee.findOne({ user_id: id });

      if (oldUser) {
        console.log("olduser: ", oldUser);
        if (oldUser.approved) {
          const updatedEmployee = {
            approved: false,
            active: false,
          };
          const updatedUser = {
            approved: false,
          };

          const employeeRes = await Employee.findOneAndUpdate(
            { user_id: id },
            updatedEmployee,
            {
              new: true,
            }
          );

          const UserRes = await User.findOneAndUpdate(
            { _id: id },
            updatedUser,
            {
              new: true,
            }
          );

          logger.info(
            `${ip}: API /api/v1/employee/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Success `
          );
          return res.status(200).json({
            data: employeeRes,
            message: "User Approved/Disapproved Successfully",
          });
        } else {
          const updatedEmployee = {
            approved: true,
            active: true,
          };
          const updatedUser = {
            approved: true,
          };
          const employeeRes = await Employee.findOneAndUpdate(
            { user_id: id },
            updatedEmployee,
            {
              new: true,
            }
          );
          const UserRes = await User.findOneAndUpdate(
            { _id: id },
            updatedUser,
            {
              new: true,
            }
          );

          logger.info(
            `${ip}: API /api/v1/employee/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Success `
          );
          return res.status(200).json({
            data: employeeRes,
            message: "User Approved/Disapproved Successfully",
          });
        }
      } else {
        logger.info(
          `${ip}: API /api/v1/employee/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Employee Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/employee/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Employee is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/employee/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

//@desc Change password of Client with id
//@route PUT /api/v1/client/change/pass/:id
//@access Private: Needs Login
const changePass = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const { password } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Validation Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (loggedin_user) {
      const oldUser = await Client.findOne({ _id: id });
      const salt = await bcrypt.genSalt(10);
      const securedPass = await bcrypt.hash(password, salt);
      if (oldUser) {
        const updatedUser = {
          password: securedPass,
        };
        const result = await Client.findByIdAndUpdate(id, updatedUser, {
          new: true,
        })
          .populate("department")
          .populate("roleType")
          .populate("team");
        logger.info(
          `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res.status(200).json({
          data: result,
          message: "User Password Changed Successfully",
        });
      } else {
        logger.info(
          `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Client Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Client is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

//@desc Update Client with id
//@route PUT /api/v1/client/update/document/:id
//@access Private: Needs Login
const updateDocument = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;

  const data = matchedData(req);
  console.log("data: ", data, id);

  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Validation Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (loggedin_user) {
    try {
      const oldUser = await Client.findOne({ user_id: id });
      console.log("oldUser: ", oldUser);
      if (oldUser) {
        let client = "";

        if (data.document_type == "adhar") {
          const res = await Client.findOneAndUpdate(
            { user_id: id },
            {
              adhar_proof_url: data.document_url,
              adhar_proof: true,
              adhar_proof_url_id: data.document_url_id,
            },
            {
              new: true,
            }
          );
          client = res;
        }

        if (data.document_type == "pan") {
          const res = await Client.findOneAndUpdate(
            { user_id: id },
            {
              pan_proof_url: data.document_url,
              pan_proof: true,
              pan_proof_url_id: data.document_url_id,
            },
            {
              new: true,
            }
          );
          client = res;
        }

        if (data.document_type == "gst") {
          const res = await Client.findOneAndUpdate(
            { user_id: id },
            {
              gst_proof_url: data.document_url,
              gst_proof: true,
              gst_proof_url_id: data.document_url_id,
            },
            {
              new: true,
            }
          );
          client = res;
        }

        if (data.document_type == "cin") {
          const res = await Client.findOneAndUpdate(
            { user_id: id },
            {
              cin_proof_url: data.document_url,
              cin_proof: true,
              cin_proof_url_id: data.document_url_id,
            },
            {
              new: true,
            }
          );
          client = res;
        }

        logger.info(
          `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res
          .status(200)
          .json({ data: client, message: "User Updated Successfully" });
      } else {
        logger.info(
          `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Client Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } catch (error) {
      logger.error(
        `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Error `
      );
      return res
        .status(500)
        .json({ data: error, message: "Something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

module.exports = {
  testEmployeeAPI,
  createEmployee,
  createEmployeesByExcel,

  getAllEmployees,
  getClientEmployees,
  getEmployeeByEmail,
  getEmployee,

  updateEmployee,
  deleteEmployee,

  AppDisEmployee,
  updateDocument,
  changePass,
};
