const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const { validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const logger = require("../config/logger.js");
const Client = require("../models/Client");

const secret = process.env.ACCESS_TOKEN_SECERT;

//@desc Test User API
//@route GET /api/v1/user
//@access Private: Needs Login
const testUserAPI = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;

  if (user) {
    logger.info(
      `${ip}: API /api/v1/user | User:  ${user.name}| responnded with "User API Test Successfully" `
    );
    return res.status(200).send("User API Test Successfully");
  } else {
    logger.error(
      `${ip}: API /api/v1/user | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Create New User
//@route POST /api/v1/user/add
//@access Private: Needs Login
const createUser = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user || "user";

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (user) {
    const data = matchedData(req);

    const oldUser = await User.findOne({ email: data.email });
    if (oldUser) {
      logger.error(
        `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with User already registered! for email: ${data.email} `
      );
      return res.status(400).json({ message: "User already registered!" });
    }

    const salt = await bcrypt.genSalt(10);
    const securedPass = await bcrypt.hash(data.password, salt);
    await User.create({
      name: data.name,
      email: data.email,
      whatsapp_no: data.whatsapp_no,
      password: securedPass,
      adhar_card: data.adhar_card,
      roleType: data.roleType,
      team: data.team,
      department: data.department,
      city: data.city,
      state: data.state,
      country: data.country,
      address: data.address,
      pin_code: data.pin_code,
    })
      .then((user) => {
        logger.info(
          `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with Success `
        );
        return res.status(201).json(user);
      })
      .catch((err) => {
        logger.error(
          `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with Error `
        );
        return res.status(500).json({ error: "Error", message: err.message });
      });
  } else {
    logger.error(
      `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Get all Users
//@route GET /api/v1/user/getall
//@access Private: Needs Login
const getUsers = async (req, res) => {
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (user) {
      const users = await User.find({
        active: true,
      })
        .populate("department")
        .populate("roleType")
        .populate("team");
      logger.info(
        `${ip}: API /api/v1/user/getall | User: ${user.name} | responnded with Success `
      );
      return await res.status(200).json({
        data: users,
        message: "User retrived successfully",
      });
    } else {
      logger.error(
        `${ip}: API /api/v1/user/getall | User: ${user.name} | responnded with User is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/user/getall | User: ${user.name} | responnded with Error `
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Get User with id
//@route GET /api/v1/user/get/:id
//@access Private: Needs Login
const getUser = async (req, res) => {
  const loggedin_user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    if (loggedin_user) {
      const { id } = req.params;
      const user = await User.find({
        _id: id,
      })
        .populate("department")
        .populate("roleType")
        .populate("team");
      if (user.length > 0) {
        logger.info(
          `${ip}: API /api/v1/user/get/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return await res.status(200).json({
          data: user,
          message: "User retrived successfully",
        });
      } else {
        logger.info(
          `${ip}: API /api/v1/user/get/:${id} | User: ${loggedin_user.name} | responnded Empty i.e. User was not found `
        );
        return await res.status(200).json({
          message: "User Not Found",
        });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/user/get/:${id} | User: ${loggedin_user.name} | responnded with User is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/user/get/:id | User: ${loggedin_user.name} | responnded with Error `
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Update User with id
//@route PUT /api/v1/user/update/:id
//@access Private: Needs Login
const updateUser = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const { name, whatsapp_no, roleType, department, team } = req.body;

  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/user/update/:${id} | User: ${loggedin_user.name} | responnded with Validation Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (loggedin_user) {
    try {
      const updatedUser = {
        name,
        whatsapp_no,
        roleType,
        department,
        team,
      };
      const oldUser = await User.findOne({ _id: id });
      if (oldUser) {
        const result = await User.findByIdAndUpdate(id, updatedUser, {
          new: true,
        })
          .populate("department")
          .populate("roleType")
          .populate("team");

        if (result.roleType.name === "client") {
          const client = await Client.findOneAndUpdate(
            { user_id: id },
            {
              name: result.name,
              whatsapp_no: result.whatsapp_no,
              address: result.address,
              city: result.city,
              state: result.state,
              country: result.country,
              pincode: result.pincode,
            }
          );
        }

        logger.info(
          `${ip}: API /api/v1/user/update/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res
          .status(200)
          .json({ data: result, message: "User Updated Successfully" });
      } else {
        logger.info(
          `${ip}: API /api/v1/user/update/:${id} | User: ${loggedin_user.name} | responnded with User Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } catch (error) {
      logger.error(
        `${ip}: API /api/v1/user/update/:${id} | User: ${loggedin_user.name} | responnded with Error `
      );
      return res
        .status(500)
        .json({ data: error, message: "Something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/user/update/:${id} | User: ${loggedin_user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Delete User with id (we are updating active to false )
//@route PUT /api/v1/user/delete/:id
//@access Private: Needs Login
const deleteUser = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (loggedin_user) {
      const updatedUser = {
        active: false,
      };
      const oldUser = await User.findOne({ _id: id });
      if (oldUser) {
        const result = await User.findByIdAndUpdate(id, updatedUser, {
          new: true,
        })
          .populate("department")
          .populate("roleType")
          .populate("team");
        logger.info(
          `${ip}: API /api/v1/user/delete/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res
          .status(200)
          .json({ data: result, message: "User Deleted Successfully" });
      } else {
        logger.info(
          `${ip}: API /api/v1/user/delete/:${id} | User: ${loggedin_user.name} | responnded with User Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/user/delete/:${id} | User: ${loggedin_user.name} | responnded with User is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/user/delete/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

//@desc User Login with email and password
//@route POST /api/v1/user/login/
//@access PUBLIC
const logIn = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!errors.isEmpty()) {
    logger.error(`${ip}: API /api/v1/user/login responnded with Error `);
    return res.status(400).json({ errors: errors.array() });
  }
  const data = matchedData(req);

  const email = data.email;
  const password = data.password;

  try {
    const oldUser = await User.findOne({ email })
      .populate("department")
      .populate("roleType")
      .populate("team");

    if (!oldUser) {
      logger.error(
        `${ip}: API /api/v1/user/login responnded with User Not Found for the user: ${email}`
      );
      return res.status(404).json({ message: "User Not Found, Please Signup" });
    }

    if (!oldUser.active) {
      logger.error(
        `${ip}: API /api/v1/user/login responnded with User Deleted for the user: ${email}`
      );
      return res.status(404).json({ message: "User Deleted" });
    }

    if (!oldUser.approved) {
      logger.error(
        `${ip}: API /api/v1/user/login responnded with user Disabled: ${email}`
      );
      return res.status(402).json({ status: 402, message: "User Disabled" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) {
      logger.error(
        `${ip}: API /api/v1/user/login responnded with Incorrect Password for the user: ${email}`
      );
      return res
        .status(401)
        .json({ status: 401, message: "Incorrect Password" });
    }

    const token = jwt.sign({ user: oldUser }, secret, {
      expiresIn: "48hr",
    });
    //console.log(token);
    logger.info(
      `${ip}: API /api/v1/user/login responnded with Login Successfull for the user: ${email}`
    );
    return res
      .status(200)
      .json({ data: oldUser, token, message: "Login Successfull" });
  } catch (error) {
    logger.info(`${ip}: API /api/v1/user/login responnded with error`);
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Get current Logged in USer
//@route POST /api/v1/user/getCurrent/
//@access Private Needs Login
const getCurrent = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    const user = await User.find({
      _id: req.user._id,
    })
      .populate("department")
      .populate("roleType")
      .populate("team");

    if (user.length > 0) {
      logger.info(
        `${ip}: API /api/v1/user/getCurrent/:${req.user._id}  responnded with Success `
      );
      return await res.status(200).json({
        user: user[0],
      });
    }
  } catch (error) {
    console.log(error);
    logger.info(`${ip}: API /api/v1/user/getCurrent responnded with the Error`);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Update User approved with id (we are updating active to false )
//@route PUT /api/v1/user/app_dis/:id
//@access Private: Needs Login
const AppDisUser = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (loggedin_user) {
      const oldUser = await User.findOne({ _id: id });

      if (oldUser) {
        if (oldUser.approved) {
          const updatedUser = {
            approved: false,
          };
          const result = await User.findByIdAndUpdate(id, updatedUser, {
            new: true,
          })
            .populate("department")
            .populate("roleType")
            .populate("team");

          logger.info(
            `${ip}: API /api/v1/user/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Success `
          );
          return res.status(200).json({
            data: result,
            message: "User Approved/Disapproved Successfully",
          });
        } else {
          const updatedUser = {
            approved: true,
          };
          const result = await User.findByIdAndUpdate(id, updatedUser, {
            new: true,
          });

          logger.info(
            `${ip}: API /api/v1/user/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Success `
          );
          return res.status(200).json({
            data: result,
            message: "User Approved/Disapproved Successfully",
          });
        }
      } else {
        logger.info(
          `${ip}: API /api/v1/user/app_dis/:${id} | User: ${loggedin_user.name} | responnded with User Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/user/app_dis/:${id} | User: ${loggedin_user.name} | responnded with User is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/user/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

//@desc Change password of User with id
//@route PUT /api/v1/user/change/pass/:id
//@access Private: Needs Login
const changePass = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const { password } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/user/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Validation Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (loggedin_user) {
      const oldUser = await User.findOne({ _id: id });
      const salt = await bcrypt.genSalt(10);
      const securedPass = await bcrypt.hash(password, salt);
      if (oldUser) {
        const updatedUser = {
          password: securedPass,
        };
        const result = await User.findByIdAndUpdate(id, updatedUser, {
          new: true,
        })
          .populate("department")
          .populate("roleType")
          .populate("team");
        logger.info(
          `${ip}: API /api/v1/user/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res.status(200).json({
          data: result,
          message: "User Password Changed Successfully",
        });
      } else {
        logger.info(
          `${ip}: API /api/v1/user/change/pass/:${id} | User: ${loggedin_user.name} | responnded with User Not Found `
        );
        return res.status(404).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/user/change/pass/:${id} | User: ${loggedin_user.name} | responnded with User is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/user/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

module.exports = {
  testUserAPI,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  logIn,
  getCurrent,
  AppDisUser,
  changePass,
};
