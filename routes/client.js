const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  testClientAPI,
  createClient,
  updateCreatedClient,
  AddClientDetails,
  getAllClients,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getCurrent,
  AppDisClient,
  updateDocument,
  changePass,
} = require("../controllers/client");
const validateToken = require("../middleware/validateTokenHandler");

//@desc Test Client API
//@route GET /api/v1/client
//@access Private: Needs Login
router.get("/", validateToken, testClientAPI);

//@desc Create New Client
//@route POST /api/v1/client/add
//@access Private: Needs Login
router.post(
  "/add",
  validateToken,
  [
    body("user_id"),
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("whatsapp_no", "Enter a Valid Whatsapp Number").notEmpty().isNumeric(),
    body("password", "Password must have atlest 5 character").notEmpty(),
    body("adhar_card", "Enter a valid adhar_card").notEmpty(),
    body("city", "Enter a Valid city"),
    body("state", "Enter a Valid state"),
    body("country", "Enter a Valid country"),
    body("address", "Enter a Valid address"),
    body("pin_code", "Enter a Valid pin_code").isNumeric(),
    body("roleType", "Select a valid role id").notEmpty(),
    body("team", "Select a valid team id").notEmpty(),
    body("department", "Select a valid department id").notEmpty(),
  ],
  createClient
);

//@desc Update Newly Created Client
//@route POST /api/v1/client/update/created/client
//@access Private: Needs Login
router.post(
  "/update/created/client",
  validateToken,
  [
    body("user_id", "Enter a valid user id").notEmpty(),
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("whatsapp_no", "Enter a Valid Whatsapp Number").notEmpty().isNumeric(),
    body("password", "Password must have atlest 5 character").notEmpty(),
    body("city", "Enter a Valid city"),
    body("state", "Enter a Valid state"),
    body("country", "Enter a Valid country"),
    body("address", "Enter a Valid address"),
    body("pin_code", "Enter a Valid pin_code").isNumeric(),
    body("roleType", "Select a valid role id").notEmpty(),
    body("team", "Select a valid team id").notEmpty(),
    body("department", "Select a valid department id").notEmpty(),
  ],

  updateCreatedClient
);

//@desc Login Client
//@route POST /api/v1/client/add/details/:id
//@access Private: Needs Login
router.put(
  "/add/details/:id",
  validateToken,
  [
    body("pan_card", "Enter a valid pan card").notEmpty(),
    body("adhar_card", "Enter a valid adhar card").notEmpty(),
    body("gst_no", "Enter a valid gst number").notEmpty(),
    body("cin_no", "Enter a valid cin number").notEmpty(),
    body("incorporation_type", "Enter a valid incorporation type").notEmpty(),
    body("industry_type", "Enter a valid industry type").notEmpty(),
    body("employee_count_range", "Enter a valid employee count range"),
    body("contact_person.name", "Enter a valid contact person name").notEmpty(),
    body("contact_person.email", "Enter a valid contact person email")
      .isEmail()
      .notEmpty(),
    body(
      "contact_person.contact_no",
      "Enter a valid contact person contact number"
    )
      .notEmpty()
      .isNumeric(),
    body(
      "contact_person.designation",
      "Enter a valid contact person designation"
    ).notEmpty(),
  ],
  AddClientDetails
);

//@desc Get current Logged in Client
//@route POST /api/v1/client/getCurrent/
//@access Private: Needs Login
router.get("/getCurrent/", validateToken, getCurrent);

//@desc Get all Clients
//@route GET /api/v1/client/getall
//@access Private: Needs Login
router.get("/get/all/clients", validateToken, getAllClients);

//@desc Get all Clients
//@route GET /api/v1/client/getall
//@access Private: Needs Login
router.get("/get/clients/:client_user_id", validateToken, getClients);

//@desc Get Client with id
//@route GET /api/v1/client/get/:id
//@access Private: Needs Login
router.get("/get/:id", validateToken, getClient);

//@desc Update Client with id
//@route PUT /api/v1/client/update/:id
//@access Private: Needs Login
router.put(
  "/update/:id",
  [
    body("user_id", "Enter a valid user id").notEmpty(),
    body("name", "Enter a valid name").isLength({ min: 3 }),

    body("whatsapp_no", "Enter a Valid Whatsapp Number").notEmpty().isNumeric(),

    body("pan_card", "Enter a valid PAN card number").notEmpty(),
    body("adhar_card", "Enter a valid Aadhar card number").notEmpty(),
    body("gst_no", "Enter a valid GST number").notEmpty(),
    body("cin_no", "Enter a valid CIN number").notEmpty(),
    body("industry_type", "Enter a valid industry type").notEmpty(),
    body(
      "employee_count_range",
      "Enter a valid employee count range"
    ).notEmpty(),
    body("contact_person.name", "Enter a valid contact person name").notEmpty(),
    body(
      "contact_person.email",
      "Enter a valid contact person email"
    ).isEmail(),
    body(
      "contact_person.contact_no",
      "Enter a valid contact person contact number"
    )
      .notEmpty()
      .isNumeric(),
    body(
      "contact_person.designation",
      "Enter a valid contact person designation"
    ).notEmpty(),
    body("incorporation_type", "Enter a valid incorporation type").notEmpty(),
    body("user_id", "Select a valid Client id").notEmpty(),
  ],
  validateToken,
  updateClient
);

//@desc Update Client with id
//@route PUT /api/v1/client/update/document/:id
//@access Private: Needs Login
router.put(
  "/update/document/:id",
  [
    body("document_type", "ducument_type is required").notEmpty(),
    body("document_url", "document_url is required").notEmpty(),
    body("document_url_id", "document_id is required").notEmpty(),
  ],
  validateToken,
  updateDocument
);

//@desc Change password of Client with id
//@route PUT /api/v1/client/change/pass/:id
//@access Private: Needs Login
router.put("/change/pass/:id", [
  body("password", "Enter a valid Password").isLength({ min: 3 }),
]);

//@desc Delete Client with id (we are updating active to false )
//@route PUT /api/v1/client/delete/:id
//@access Private: Needs Login
router.put("/delete/:id", validateToken, deleteClient);

//@desc Update Client approved with id (we are updating active to false )
//@route PUT /api/v1/client/app_dis/:id
//@access Private: Needs Login
router.put("/app_dis/:id", validateToken, AppDisClient);

module.exports = router;
