const mongoose = require("mongoose");
const Department = require("../models/Department.js");
const Team = require("../models/Team.js");
const Role = require("../models/Role.js");
const User = require("./User.js");

const { Schema } = mongoose;

const ContactPersonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact_no: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
});

const ClientSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  pan_card: {
    type: String,
    required: true,
  },
  adhar_card: {
    type: String,
    required: true,
  },
  gst_no: {
    type: String,
    required: true,
  },
  cin_no: {
    type: String,
    required: true,
  },
  whatsapp_no: {
    type: String,
    required: true,
  },
  industry_type: {
    type: String,
    required: true,
  },
  employee_count_range: {
    type: String,
    required: true,
  },
  contact_person: {
    type: ContactPersonSchema,
    required: true,
  },
  incorporation_type: {
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

module.exports = mongoose.model("Client", ClientSchema);
