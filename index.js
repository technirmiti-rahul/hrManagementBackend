const AWS = require("aws-sdk");
const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const logger = require("./config/logger.js");
const connectToMongo = require("./config/db.js");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

connectToMongo();

const app = express();
app.use(bodyParser.json({ limit: "30mb" })); // Set the limit as needed
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5001;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "eu-north-1",
  endpoint: "s3.eu-north-1.amazonaws.com",
});

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

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
app.use("/api/v1/document", require("./routes/document.js"));
app.use("/api/v1/employee", require("./routes/employee.js"));

/* ///////////////////////////////////////////////--------//////////////////////////////////////////////////////////////////// */

const upload2 = multer({ dest: "uploads/" }); // Destination folder for multer to store temporary files

app.post("/client/upload/document", upload2.single("file"), (req, res) => {
  const file = req.file; // File object

  const uploadParams = {
    Bucket: "digitalhrs3bucket",
    Key: file.originalname,
    Body: fs.readFileSync(file.path),
  };

  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
      res.status(500).json({ error: err.message });
    }
    if (data) {
      console.log("Upload Success", data);
      res.status(201).json({ location: data });
    }
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
