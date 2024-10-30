const mongoose = require("mongoose");
const Employee = require("./Employee.js");
const User = require("./User.js");

const { Schema } = mongoose;

const AttendanceSchema = new Schema({
  client_user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  /* emp_no: {
    type: String,
    required: true,
  }, */
  gross: {
    type: Number,
    required: true,
  },
  lwf: {
    type: Boolean,
    default: false,
  },

  month_year: {
    type: Date,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  present: {
    type: Number,
    required: true,
  },
  totalWorkingDays: {
    type: Number,
    required: true,
  },

  remark: {
    type: String,
    default: "NA",
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

module.exports = mongoose.model("Attendance", AttendanceSchema);
