const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  testDocumentAPI,
  uploadDocument,
} = require("../controllers/document.js");
const validateToken = require("../middleware/validateTokenHandler");

const upload = multer({ storage: multer.memoryStorage() });

//@desc Test Client API
//@route GET /api/v1/client
//@access Private: Needs Login
router.get("/", validateToken, testDocumentAPI);

//@desc Upload document
//@route POST /api/v1/document/upload
//@access Private: Needs Login
router.post("/upload", validateToken, upload.single("file"), uploadDocument);

module.exports = router;
