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
const uploadDocument = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const { document, id } = req.params;

  console.log(document, id);

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/document/upload | User: ${user.name} | responnded with User is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  try {
    const file = req.file;

    if (!file || !file.originalname || !file.buffer) {
      throw new Error("File upload failed");
    }

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `documents/${document + id + file.originalname}`,
      Body: file.buffer,
      ContentType: "application/pdf",
    };

    const data = await s3.upload(uploadParams).promise();

    res.setHeader("Content-Disposition", "");
    console.log("data: ", data);

    logger.info(
      `${ip}: API /api/v1/document/upload | User:  ${user.name}| document uploaded successfully`
    );
    return res
      .status(201)
      .json({ location: data, file_id: document + id + file.originalname });
  } catch (err) {
    logger.error(
      `${ip}: API /api/v1/document/upload | User: ${user.name} | error uploading document: ${err.message}`
    );
    return res.status(500).json({ error: err.message });
  }
};

// @description Upload document
// @route POST /api/v1/document/upload/
// @access Private: Needs Login

const deleteDocument = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const { filename, client_id, file_type } = req.params;
  console.log(
    "filename: ",
    filename,
    " client_id: ",
    client_id,
    " file_type: ",
    file_type
  );

  const file_proof = file_type + "_proof";
  const file_proof_url = file_type + "_proof_url";
  const file_proof_url_id = file_type + "_proof_url_id";

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `documents/${filename}`,
  };

  try {
    const deleted = await s3.deleteObject(params).promise();
    console.log("deleted: ", deleted);
    let client = "";
    if (deleted) {
      client = await Client.findOneAndUpdate(
        { user_id: client_id },
        {
          [file_proof]: false,
          [file_proof_url]: null,
          [file_proof_url_id]: null,
        },
        { new: true }
      );
    }

    logger.info(
      `${ip}: API /api/v1/document/delete | User:  ${user.name}| document deleted successfully`
    );
    return res
      .status(200)
      .json({ result: client, message: "Document deleted successfully" });
  } catch (err) {
    console.log(err);
    logger.error(
      `${ip}: API /api/v1/document/delete | User: ${user.name} | error deleting document: ${err.message}`
    );
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  testDocumentAPI,
  uploadDocument,
  deleteDocument,
};
