const mongoose = require("mongoose");
const Employee = require("./Employee.js");
const User = require("./User.js");

const { Schema } = mongoose;

const AttendanceDataSchema = new Schema({
  emp_id: {
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
});

const AttendanceSchema = new Schema({
  client_user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  AttendanceData: [AttendanceDataSchema],

  month_year: {
    type: String,
    required: true,
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
