const User = require("./User.js");
const Client = require("./Client.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  client_user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  client_id: {
    type: Schema.Types.ObjectId,
    ref: "Client",
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
  whatsapp_no: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  date_of_joining: {
    type: Date,
    required: true,
  },
  address: {
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
  pin_code: {
    type: String,
    required: true,
  },

  adhar_card: {
    type: Number,
    required: true,
    unique: true,
  },
  uan_no: {
    type: Number,
  },
  pf_no: {
    type: Number,
  },
  esic_no: {
    type: Number,
  },
  bank_name: {
    type: String,
  },
  bank_ac_no: {
    type: Number,
  },
  bank_ifsc: {
    type: String,
  },
  pf_basic: {
    type: Number,
  },
  basic: {
    type: Number,
  },
  da: {
    type: Number,
  },
  hra: {
    type: Number,
  },
  food_allow: {
    type: Number,
  },
  conveyance: {
    type: Number,
  },
  epf: {
    type: Number,
  },
  esic: {
    type: Number,
  },
  lwf: {
    type: Number,
  },
  e_epf: {
    type: Number,
  },
  e_esic: {
    type: Number,
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
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
/*   form: {
        client_user_id: '',
        client_id: '',
        name: '',
        email: '',
        password: '',
        whatsapp_no: '',
        roleType: '',
        team: '',
        department: '',
        city: '',
        state: '',
        country: '',
        address: '',
        pin_code: '',
        designation: '',
        date_of_joining: '',

        uan_no: '',
        pf_no: '',
        esic_no: '',
        bank_name: '',
        bank_ac_no: '',
        bank_ifsc: '',
        pf_basic: '',
        basic: '',
        da: '',
        hra: '',
        food_allow: '',
        conveyance: '',
        epf: '',
        esic: '',
        lwf: '',
        e_epf: '',
        e_esic: '',
      }, */
