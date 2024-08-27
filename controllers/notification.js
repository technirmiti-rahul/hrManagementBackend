const { validationResult, matchedData } = require("express-validator");
const logger = require("../config/logger.js");
const User = require("../models/User.js");
const Notification = require("../models/Notification.js");

//@desc Test Role API
//@route GET /api/v1/notification
//@access Private: Needs Login
const testNotificationAPI = async (req, res) => {
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (user) {
    logger.info(
      `${ip}: API /api/v1/notification | User: ${user.name} | responnded with Role Api Successful `
    );
    return res
      .status(200)
      .send({ data: user, message: "Notification Api Successful" });
  } else {
    logger.error(
      `${ip}: API /api/v1/notification | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Create New Role
//@route POST /api/v1/notification/add
//@access Private: Needs Login
const createNotification = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;

  if (!errors.isEmpty()) {
    logger.error(`${ip}: API /api/v1/role/add responnded with Error `);
    return res.status(400).json({ errors: errors.array() });
  }

  if (user) {
    const data = matchedData(req);

    try {
      const response = await Notification.create({
        text: data.text,
        type: data.type,
        to_user: data.to_user,
        by_user: data.by_user,
      });

      return res
        .status(201)
        .send({ data: response, message: "notification created" });
    } catch (err) {
      return res.status(500).send({ message: "something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/role/add | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Get By Id Notification
//@route GET /api/v1/notification/get/:id
//@access Private: Needs Login
const GetNotificationById = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const id = req.params.id;
  console.log("id: ", id);

  if (!errors.isEmpty()) {
    logger.error(`${ip}: API /api/v1/role/add responnded with Error `);
    return res.status(400).json({ errors: errors.array() });
  }

  if (user) {
    const data = matchedData(req);

    try {
      const response = await Notification.findById(id);

      return res.status(201).send({ data: response });
    } catch (err) {
      return res.status(500).send({ message: "something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/role/add | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Dismiss Notification API
//@route PUT /api/v1/notification/dissmiss/:id
//@access Private: Needs Login
const DismissNotification = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const id = req.params.id;
  console.log("id: ", id);

  if (!errors.isEmpty()) {
    logger.error(`${ip}: API /api/v1/role/add responnded with Error `);
    return res.status(400).json({ errors: errors.array() });
  }

  if (user) {
    const data = matchedData(req);

    try {
      const response = await Notification.findOneAndUpdate(
        { _id: id },
        { dismissed: true },
        {
          new: true,
        }
      );

      return res.status(201).send({ data: response });
    } catch (err) {
      return res.status(500).send({ message: "something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/role/add | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Get All Notification
//@route GET /api/v1/notification/get/:id
//@access Private: Needs Login
const GetAllNotificationsById = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const id = req.params.id;
  console.log("id: ", id);

  if (!errors.isEmpty()) {
    logger.error(`${ip}: API /api/v1/role/add responnded with Error `);
    return res.status(400).json({ errors: errors.array() });
  }

  if (user) {
    const data = matchedData(req);

    try {
      const response = await Notification.find({
        to_user: id,
        dismissed: false,
      });

      return res.status(201).send({ data: response });
    } catch (err) {
      return res.status(500).send({ message: "something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/role/add | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

module.exports = {
  testNotificationAPI,
  createNotification,
  GetNotificationById,
  DismissNotification,
  GetAllNotificationsById,
};
