const mongoose = require("mongoose");
const Department = require("../models/Department.js");
const Team = require("../models/Team.js");
const Role = require("../models/Role.js");

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  whatsapp_no: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pin_code: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  team: {
    type: "ObjectId",
    ref: Team,
  },
  department: {
    type: "ObjectId",
    ref: Department,
  },
  roleType: {
    type: "ObjectId",
    ref: Role,
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("User", UserSchema);

//RoleType:
//super_admin //Highest Priority 1
//admin //Priority 2
//user //Priority 3
//customer //Business   //Priority 4
//employee //Priority 5
