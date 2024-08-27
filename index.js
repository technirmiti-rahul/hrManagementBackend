const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const logger = require("./config/logger.js");
const connectToMongo = require("./config/db.js");
const bodyParser = require("body-parser");

connectToMongo();

const app = express();
app.use(bodyParser.json({ limit: "30mb" })); // Set the limit as needed
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5001;

//@desc Test Backend API
//@route GET /api/v1/
//@access Public
app.get("/api/v1/", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  res.status(200).send("Welcome to Backend API for DigitalHR");
  logger.info(
    `${ip}: API /api/v1/ responnded with "Welcome to Backend API for DigitalHR" `
  );
});

//Routes
app.use("/api/v1/user", require("./routes/user.js"));
app.use("/api/v1/team", require("./routes/team.js"));
app.use("/api/v1/department", require("./routes/department.js"));
app.use("/api/v1/role", require("./routes/role.js"));
app.use("/api/v1/notification", require("./routes/notification.js"));
app.use("/api/v1/client", require("./routes/client.js"));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
