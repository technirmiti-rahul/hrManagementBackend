const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  testRoleAPI,
  createRole,
  updateRole,
  deleteRole,
  getRoles,
  getRole,
} = require("../controllers/role.js");
const validateToken = require("../middleware/validateTokenHandler");

//@desc Test Role API
//@route GET /api/v1/role
//@access Private: Needs Login
router.get("/", validateToken, testRoleAPI);

//@desc Create New Role
//@route POST /api/v1/role/add
//@access Private: Needs Login
router.post(
  "/add",
  [body("name", "Enter a valid name").isLength({ min: 3 })],
  validateToken,
  createRole
);

//@desc Update Role with id
//@route PUT /api/v1/role/update/:id
//@access Private:Needs Login
router.put(
  "/update/:id",
  [body("name", "Enter a valid name").isLength({ min: 3 })],
  validateToken,
  updateRole
);

//@desc Delete Role with id (we are updating active to false )
//@route PUT /api/v1/role/delete/:id
//@access private: Needs Login
router.put("/delete/:id", validateToken, deleteRole);

//@desc Get all Roles
//@route GET /api/v1/roles/getall
//@access private: Needs Login
router.get("/getall", validateToken, getRoles);

//@desc Get Role by id
//@route GET /api/v1/roles/get/:id
//@access private: Needs Login
router.get("/get/:id", validateToken, getRole);

module.exports = router;
