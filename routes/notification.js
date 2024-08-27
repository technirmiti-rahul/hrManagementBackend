const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validateToken = require("../middleware/validateTokenHandler");
const {
  createNotification,
  DismissNotification,
  GetAllNotificationsById,
  GetNotificationById,
  testNotificationAPI,
} = require("../controllers/notification.js");

//@desc Test Notification API
//@route GET /api/v1/notification
//@access Private: Needs Login
router.get(
  "/",
  validateToken,

  testNotificationAPI
);

//@desc Create Notification API
//@route POST /api/v1/notification/add
//@access Private: Needs Login
router.post(
  "/add",
  validateToken,
  [
    body("text", "Enter a valid text"),
    body("type", "Enter a Valid type"),
    body("to_user", "Enter a Valid to_user"),
    body("by_user", "Enter a Valid by_user"),
  ],
  createNotification
);

//@desc Get By Id Notification
//@route GET /api/v1/notification/get/:id
//@access Private: Needs Login
router.get("/get/:id", validateToken, GetNotificationById);

//@desc Dismiss Notification API
//@route PUT /api/v1/notification/dissmiss/:id
//@access Private: Needs Login
router.put("/dismiss/:id", validateToken, DismissNotification);

//@desc Get All
//@route GET /api/v1/notification/getall/:id
//@access Private: Needs Login
router.get("/getall/:id", validateToken, GetAllNotificationsById);

module.exports = router;
