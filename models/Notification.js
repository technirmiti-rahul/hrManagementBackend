const mongoose = require("mongoose");
const User = require("./User");

const { Schema } = mongoose;

const NotificationSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  to_user: {
    type: "ObjectId",
    ref: User,
  },
  by_user: {
    type: "ObjectId",
    ref: User,
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  dismissed: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);

/* 

Type:{
success,
warning,
danger
}

*/
