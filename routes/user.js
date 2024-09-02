const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
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
} = require("../controllers/user");
const validateToken = require("../middleware/validateTokenHandler");

//@desc Test User API
//@route GET /api/v1/user
//@access Private: Needs Login
router.get("/", validateToken, testUserAPI);

//@desc Create New User
//@route POST /api/v1/user/add
//@access Private: Needs Login
router.post(
  "/add",
  validateToken,
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("whatsapp_no", "Enter a Valid Whatsapp Number").notEmpty().isNumeric(),
    body("password", "Password must have atlest 5 character").isLength({
      min: 5,
    }),
    body("city", "Enter a Valid city"),
    body("state", "Enter a Valid state"),
    body("country", "Enter a Valid country"),
    body("address", "Enter a Valid address"),
    body("pin_code", "Enter a Valid pin_code").isNumeric(),
    body("roleType", "Select a valid role id").notEmpty(),
    body("team", "Select a valid team id").notEmpty(),
    body("department", "Select a valid department id").notEmpty(),
  ],
  createUser
);

//@desc User Login with email and password
//@route POST /api/v1/user/login/
//@access PUBLIC
router.post(
  "/login/",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password must have atlest 5 character").notEmpty(),
  ],
  logIn
);

//@desc Get current Logged in User
//@route POST /api/v1/user/getCurrent/
//@access Private: Needs Login
router.get("/getCurrent/", validateToken, getCurrent);

//@desc Get all Users
//@route GET /api/v1/user/getall
//@access Private: Needs Login
router.get("/getall", validateToken, getUsers);

//@desc Get User with id
//@route GET /api/v1/user/get/:id
//@access Private: Needs Login
router.get("/get/:id", validateToken, getUser);

//@desc Update User with id
//@route PUT /api/v1/user/update/:id
//@access Private: Needs Login
router.put(
  "/update/:id",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("whatsapp_no", "Enter a Valid Whatsapp Number").notEmpty().isNumeric(),
    body("roleType", "Select a valid role id").notEmpty(),
    body("team", "Select a valid team id").notEmpty(),
    body("department", "Select a valid department id").notEmpty(),
  ],
  validateToken,
  updateUser
);

//@desc Change password of User with id
//@route PUT /api/v1/user/change/pass/:id
//@access Private: Needs Login
router.put(
  "/change/pass/:id",
  [body("password", "Enter a valid Password").isLength({ min: 3 })],
  validateToken,
  changePass
);

//@desc Delete User with id (we are updating active to false )
//@route PUT /api/v1/user/delete/:id
//@access Private: Needs Login
router.put("/delete/:id", validateToken, deleteUser);

//@desc Update User approved with id (we are updating active to false )
//@route PUT /api/v1/user/app_dis/:id
//@access Private: Needs Login
router.put("/app_dis/:id", validateToken, AppDisUser);

module.exports = router;
