const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  testDocumentAPI,
  uploadDocument,
  deleteDocument,
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
router.post(
  "/upload/:document/:id",
  validateToken,
  upload.single("file"),
  uploadDocument
);

//@desc Delete document
//@route DELETE /api/v1/document/delete
//@access Private: Needs Login
router.delete(
  "/delete/:client_id/:filename/:file_type",
  validateToken,
  deleteDocument
);

module.exports = router;
