const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  testEmployeeAPI,
  createEmployee,
  createEmployeesFromExcel,
  updateEmployee,
  deleteEmployee,
  getClientEmployees,
  getEmployee,

  AppDisEmployee,
  updateDocument,
  changePass,
} = require("../controllers/employee");
const validateToken = require("../middleware/validateTokenHandler");

//@desc Test Employee API
//@route GET /api/v1/employee
//@access Private: Needs Login
router.get("/", validateToken, testEmployeeAPI);

//@desc Create New Employee
//@route POST /api/v1/employee/add
//@access Private: Needs Login
router.post(
  "/add",

  [
    body("client_user_id", "Enter a valid client user id").notEmpty(),
    body("client_id"),
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("whatsapp_no", "Enter a Valid Whatsapp Number").notEmpty().isNumeric(),
    body("password", "Password must have atlest 5 character").notEmpty(),
    body("city", "Enter a Valid city"),
    body("state", "Enter a Valid state"),
    body("country", "Enter a Valid country"),
    body("address", "Enter a Valid address"),
    body("pin_code", "Enter a Valid pin_code").isNumeric(),
    body("roleType", "Select a valid role id").notEmpty(),
    body("team", "Select a valid team id").notEmpty(),
    body("department", "Select a valid department id").notEmpty(),
    body("designation", "Enter a Valid designation").notEmpty(),
    body("date_of_joining", "Enter a Valid date_of_joining").isDate(),
  ],
  validateToken,
  createEmployee
);

//@desc Create New Employee
//@route POST /api/v1/employee/add/employees/excel
//@access Private: Needs Login
router.post(
  "/add/employees/excel",

  [
    body("client_user_id", "Enter a valid client user id").notEmpty(),
    body("client_id"),
    body("employeeData", "Enter a valid employeeData"),
  ],
  validateToken,
  createEmployeesFromExcel
);

//@desc Update Employee
//@route PUT /api/v1/employee/update/:id
//@access Private: Needs Login
router.put(
  "/update/:id",

  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("whatsapp_no", "Enter a Valid Whatsapp Number").notEmpty().isNumeric(),
    body("city", "Enter a Valid city"),
    body("state", "Enter a Valid state"),
    body("country", "Enter a Valid country"),
    body("address", "Enter a Valid address"),
    body("pin_code", "Enter a Valid pin_code").isNumeric(),
    body("designation", "Enter a Valid designation").notEmpty(),
  ],
  validateToken,
  updateEmployee
);

//@desc Get all Employees
//@route GET /api/v1/employee/client_id
//@access Private: Needs Login
router.get("/get/employees/:client_id", validateToken, getClientEmployees);

//@desc Get Employee with id
//@route GET /api/v1/employee/get/:id
//@access Private: Needs Login
router.get("/get/:id", validateToken, getEmployee);

//@desc Delete Employee
//@route DELETE /api/v1/employee/delete/:id
//@access Private: Needs Login
router.delete("/delete/:id", validateToken, deleteEmployee);

//@desc Approve Employee
//@route PUT /api/v1/employee/approve/:id
//@access Private: Needs Login
router.put("/app_dis/:id", validateToken, AppDisEmployee);

//@desc Update Employee Document
//@route PUT /api/v1/employee/update/document/:id
//@access Private: Needs Login
router.put("/update/document/:id", validateToken, updateDocument);

//@desc Change Password
//@route PUT /api/v1/employee/change/password/:id
//@access Private: Needs Login
router.put("/change/password/:id", validateToken, changePass);

module.exports = router;
