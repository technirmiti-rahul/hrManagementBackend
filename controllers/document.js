const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const { validationResult, matchedData } = require("express-validator");

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Client = require("../models/Client");

const logger = require("../config/logger.js");

const secret = process.env.ACCESS_TOKEN_SECERT;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "eu-north-1",
  endpoint: "s3.eu-north-1.amazonaws.com",
});

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const upload = multer({ storage: multer.memoryStorage() });

//@desc Test Document API
//@route GET /api/v1/documemt
//@access Private: Needs Login
const testDocumentAPI = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;

  if (user) {
    logger.info(
      `${ip}: API /api/v1/client | User:  ${user.name}| responnded with "Client API Test Successfully" `
    );
    return res.status(200).send("Document API Test Successfully");
  } else {
    logger.error(
      `${ip}: API /api/v1/client | User: ${user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "Client is not Autherized" });
  }
};

//@desc Upload document
//@route POST /api/v1/document/upload/
//@access Private: Needs Login
//@access Private: Needs Login
const uploadDocument = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/document/upload | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  try {
    const file = req.file;

    // Check if file exists and has the expected properties
    if (!file || !file.originalname || !file.buffer) {
      throw new Error("File upload failed");
    }

    const uploadParams = {
      Bucket: "digitalhrs3bucket",
      Key: `documents/${file.originalname}`, // Include the folder name in the Key property
      Body: file.buffer,
      ContentType: "application/pdf", // Set the Content-Type header to application/pdf
    };

    const data = await s3.upload(uploadParams).promise();

    // Remove the Content-Disposition header from the response
    res.setHeader("Content-Disposition", "");

    logger.info(
      `${ip}: API /api/v1/document/upload | User:  ${user.name}| document uploaded successfully`
    );
    return res.status(201).json({ location: data.Location });
  } catch (err) {
    logger.error(
      `${ip}: API /api/v1/document/upload | User: ${user.name} | error uploading document: ${err.message}`
    );
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  testDocumentAPI,
  uploadDocument,
};
