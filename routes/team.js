const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  testTeamAPI,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeams,
  getTeam,
} = require("../controllers/team.js");
const validateToken = require("../middleware/validateTokenHandler");

//@desc Test Team API
//@route GET /api/v1/team
//@access Private: Needs Login
router.get("/", validateToken, testTeamAPI);

//@desc Create New Team
//@route POST /api/v1/team/add
//@access Private: Needs Login
router.post(
  "/add",
  [body("name", "Enter a valid name").isLength({ min: 3 })],
  validateToken,
  createTeam
);

//@desc Update Team with id
//@route PUT /api/v1/team/update/:id
//@access Private: Needs Login
router.put(
  "/update/:id",
  [body("name", "Enter a valid name").isLength({ min: 3 })],
  validateToken,
  updateTeam
);

//@desc Delete Team with id (we are updating active to false )
//@route PUT /api/v1/team/delete/:id
//@access private: Needs Login
router.put("/delete/:id", validateToken, deleteTeam);

//@desc Get all Teams
//@route GET /api/v1/team/getall
//@access private: Needs Login
router.get("/getall", validateToken, getTeams);

//@desc Get Team by id
//@route GET /api/v1/team/get/:id
//@access private: Needs Login
router.get("/get/:id", validateToken, getTeam);

module.exports = router;
