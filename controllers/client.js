const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const { validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Client = require("../models/Client");
const logger = require("../config/logger.js");

const secret = process.env.ACCESS_TOKEN_SECERT;

//@desc Test Client API
//@route GET /api/v1/client
//@access Private: Needs Login
const testClientAPI = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;

  if (user) {
    logger.info(
      `${ip}: API /api/v1/client | User:  ${user.name}| responnded with "Client API Test Successfully" `
    );
    return res.status(200).send("Client API Test Successfully");
  } else {
    logger.error(
      `${ip}: API /api/v1/client | User: ${user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "Client is not Autherized" });
  }
};

//@desc Create New Client
//@route POST /api/v1/client/add
//@access Private: Needs Login
const createClient = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const data = matchedData(req);
  console.log("data", data);

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  try {
    const existingUser = await Client.findOne({ email: data.email });
    if (existingUser) {
      logger.error(
        `${ip}: API /api/v1/client/add | User: ${user.name} | Responded with Client already registered! for email: ${data.email}`
      );
      return res.status(409).json({ message: "User already registered!" });
    }

    const existingClient = await Client.findOne({ email: data.email });
    if (existingClient) {
      logger.error(
        `${ip}: API /api/v1/client/add | User: ${user.name} | Responded with Client already registered! for user: ${data.email}`
      );
      return res.status(409).json({ message: "Client already registered!" });
    }

    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      whatsapp_no: data.whatsapp_no,
      city: data.city,
      address: data.address,
      country: data.country,
      state: data.state,
      pin_code: data.pin_code,
      team: data.team,
      roleType: data.roleType,
      department: data.department,
    });

    const newClient = await Client.create({
      user_id: newUser._id,
      name: data.name,
      email: data.email,
      whatsapp_no: data.whatsapp_no,
      city: data.city,
      address: data.address,
      country: data.country,
      state: data.state,
      pin_code: data.pin_code,
    });

    console.log("newClient", newClient);

    logger.info(
      `${ip}: API /api/v1/client/add | User: ${newUser.name} | Responded with Success`
    );
    return res.status(201).json(newUser);
  } catch (err) {
    logger.error(
      `${ip}: API /api/v1/client/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    console.log(err);
    return res.status(500).json({ error: "Error", message: err.message });
  }
};

//@desc Update Newly Created Client
//@route POST /api/v1/client/update/created
//@access Private: Needs Login
const updateCreated = async (req, res) => {
  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const user = req.user;
  const data = matchedData(req);
  console.log("data", data);

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/user/add | User: ${user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  try {
    const newUser = await User.findOneAndUpdate(
      { _id: data.user_id },
      {
        name: data.name,

        password: data.password,
        whatsapp_no: data.whatsapp_no,
        city: data.city,
        address: data.address,
        country: data.country,
        state: data.state,
        pin_code: data.pin_code,
        team: data.team,
        roleType: data.roleType,
        department: data.department,
      }
    );

    const newClient = await Client.findOneAndUpdate(
      { user_id: data.user_id },
      {
        name: data.name,

        whatsapp_no: data.whatsapp_no,
        city: data.city,
        address: data.address,
        country: data.country,
        state: data.state,
        pin_code: data.pin_code,
      },
      {
        new: true,
      }
    );

    console.log("newClient", newClient);

    logger.info(
      `${ip}: API /api/v1/client/add | User: ${newUser.name} | Responded with Success`
    );
    return res.status(201).json(newUser);
  } catch (err) {
    logger.error(
      `${ip}: API /api/v1/client/add | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    console.log(err);
    return res.status(500).json({ error: "Error", message: err.message });
  }
};

//@desc Add Client Details
//@route PUT /api/v1/client/add/details/:id
//@access Private: Needs Login
const AddClientDetails = async (req, res) => {
  const user = req.user;
  const id = req.params.id;
  const data = matchedData(req);

  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/add/details/:${id} | User: ${
        user?.name || "Guest"
      } | Responded with Validation Error`
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (!user) {
    logger.error(
      `${ip}: API /api/v1/client/add/details/:${id} | User: ${user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }

  try {
    const client = await Client.findOneAndUpdate(
      { user_id: id },
      {
        pan_card: data.pan_card,
        adhar_card: data.adhar_card,
        gst_no: data.gst_no,
        cin_no: data.cin_no,
        industry_type: data.industry_type,
        employee_count_range: data.employee_count_range,
        incorporation_type: data.incorporation_type,
        contact_person: {
          name: data.contact_person.name,
          email: data.contact_person.email,
          contact_no: data.contact_person.contact_no,
          designation: data.contact_person.designation,
        },
      },
      {
        new: true,
      }
    );

    if (!client) {
      logger.error(
        `${ip}: API /api/v1/client/add/details/:${id} | User: ${user.name} | Responded with Client Not Found `
      );
      return res.status(404).json({ message: "Client Not Found" });
    }

    logger.info(
      `${ip}: API /api/v1/client/add/details/:${id} | User: ${user.name} | Responded with Success`
    );
    return res.status(200).json(client);
  } catch (err) {
    logger.error(
      `${ip}: API /api/v1/client/add/details/:${id} | User: ${
        user?.name || "Guest"
      } | Responded with Error`
    );
    return res.status(500).json({ error: "Error", message: err.message });
  }
};

//@desc Get all Clients
//@route GET /api/v1/client/getall
//@access Private: Needs Login
const getClients = async (req, res) => {
  const user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (user) {
      const clients = await Client.find({
        active: true,
      }).populate("contact_person");

      logger.info(
        `${ip}: API /api/v1/client/getall | User: ${user.name} | responnded with Success `
      );
      return await res.status(200).json({
        data: clients,
        message: "User retrived successfully",
      });
    } else {
      logger.error(
        `${ip}: API /api/v1/client/getall | User: ${user.name} | responnded with Client is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/client/getall | User: ${user.name} | responnded with Error `
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Get Client with id
//@route GET /api/v1/client/get/:id
//@access Private: Needs Login
const getClient = async (req, res) => {
  const loggedin_user = req.user;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    if (loggedin_user) {
      const { id } = req.params;
      const client = await Client.find({
        _id: id,
      }).populate("contact_person");

      if (client.length > 0) {
        logger.info(
          `${ip}: API /api/v1/client/get/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return await res.status(200).json({
          data: client,
          message: "User retrived successfully",
        });
      } else {
        logger.info(
          `${ip}: API /api/v1/client/get/:${id} | User: ${loggedin_user.name} | responnded Empty i.e. Client was not found `
        );
        return await res.status(200).json({
          message: "User Not Found",
        });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/client/get/:${id} | User: ${loggedin_user.name} | responnded with Client is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/client/get/:id | User: ${loggedin_user.name} | responnded with Error `
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Update Client with id
//@route PUT /api/v1/client/update/:id
//@access Private: Needs Login
const updateClient = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;

  const data = matchedData(req);
  console.log("data: ", data);

  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Validation Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (loggedin_user) {
    try {
      const oldUser = await Client.findOne({ _id: id });
      if (oldUser) {
        const result = await Client.findByIdAndUpdate(
          id,
          {
            name: data.name,
            whatsapp_no: data.whatsapp_no,
            city: data.city,
            address: data.address,
            country: data.country,
            state: data.state,
            pin_code: data.pin_code,
            pan_card: data.pan_card,
            adhar_card: data.adhar_card,
            gst_no: data.gst_no,
            cin_no: data.cin_no,
            industry_type: data.industry_type,
            employee_count_range: data.employee_count_range,
            incorporation_type: data.incorporation_type,
            contact_person: {
              name: data.contact_person.name,
              email: data.contact_person.email,
              contact_no: data.contact_person.contact_no,
              designation: data.contact_person.designation,
            },
          },
          {
            new: true,
          }
        );

        const user = await User.findOneAndUpdate(
          { _id: data.user_id },
          {
            name: data.name,
            whatsapp_no: data.whatsapp_no,
            city: data.city,
            address: data.address,
            country: data.country,
            state: data.state,
            pin_code: data.pin_code,
          }
        );

        logger.info(
          `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res
          .status(200)
          .json({ data: result, message: "Client Updated Successfully" });
      } else {
        logger.info(
          `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Client Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } catch (error) {
      logger.error(
        `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Error `
      );
      return res
        .status(500)
        .json({ data: error, message: "Something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

//@desc Delete Client with id (we are updating active to false )
//@route PUT /api/v1/client/delete/:id
//@access Private: Needs Login
const deleteClient = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (loggedin_user) {
      const updated = {
        active: false,
      };
      const oldUser = await Client.findOne({ user_id: id });
      if (oldUser) {
        console.log("oldUser: ", oldUser);
        const clientRes = await Client.findOneAndUpdate(
          { user_id: id },
          updated,
          {
            new: true,
          }
        );

        const userRes = await User.findOneAndUpdate({ _id: id }, updated, {
          new: true,
        });

        logger.info(
          `${ip}: API /api/v1/client/delete/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res
          .status(200)
          .json({ data: clientRes, message: "User Deleted Successfully" });
      } else {
        logger.info(
          `${ip}: API /api/v1/client/delete/:${id} | User: ${loggedin_user.name} | responnded with Client Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/client/delete/:${id} | User: ${loggedin_user.name} | responnded with Client is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/client/delete/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

//@desc Get current Logged in USer
//@route POST /api/v1/client/getCurrent/
//@access Private Needs Login
const getCurrent = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    const user = await Client.find({
      _id: req.user._id,
    })
      .populate("department")
      .populate("roleType")
      .populate("team");

    if (user.length > 0) {
      logger.info(
        `${ip}: API /api/v1/client/getCurrent/:${req.user._id}  responnded with Success `
      );
      return await res.status(200).json({
        user: user[0],
      });
    }
  } catch (error) {
    console.log(error);
    logger.info(
      `${ip}: API /api/v1/client/getCurrent responnded with the Error`
    );
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//@desc Update Client approved with id (we are updating active to false )
//@route PUT /api/v1/client/app_dis/:id
//@access Private: Needs Login
const AppDisClient = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    if (loggedin_user) {
      const oldUser = await Client.findOne({ user_id: id });

      if (oldUser) {
        console.log("olduser: ", oldUser);
        if (oldUser.approved) {
          const updatedClient = {
            approved: false,
            active: false,
          };
          const updatedUser = {
            approved: false,
          };

          const clientRes = await Client.findOneAndUpdate(
            { user_id: id },
            updatedClient,
            {
              new: true,
            }
          );

          const UserRes = await User.findOneAndUpdate(
            { _id: id },
            updatedUser,
            {
              new: true,
            }
          );

          logger.info(
            `${ip}: API /api/v1/client/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Success `
          );
          return res.status(200).json({
            data: clientRes,
            message: "User Approved/Disapproved Successfully",
          });
        } else {
          const updatedClient = {
            approved: true,
            active: true,
          };
          const updatedUser = {
            approved: true,
          };
          const clientRes = await Client.findOneAndUpdate(
            { user_id: id },
            updatedClient,
            {
              new: true,
            }
          );
          const UserRes = await User.findOneAndUpdate(
            { _id: id },
            updatedUser,
            {
              new: true,
            }
          );

          logger.info(
            `${ip}: API /api/v1/client/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Success `
          );
          return res.status(200).json({
            data: clientRes,
            message: "User Approved/Disapproved Successfully",
          });
        }
      } else {
        logger.info(
          `${ip}: API /api/v1/client/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Client Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/client/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Client is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/client/app_dis/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

//@desc Change password of Client with id
//@route PUT /api/v1/client/change/pass/:id
//@access Private: Needs Login
const changePass = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;
  const { password } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Validation Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (loggedin_user) {
      const oldUser = await Client.findOne({ _id: id });
      const salt = await bcrypt.genSalt(10);
      const securedPass = await bcrypt.hash(password, salt);
      if (oldUser) {
        const updatedUser = {
          password: securedPass,
        };
        const result = await Client.findByIdAndUpdate(id, updatedUser, {
          new: true,
        })
          .populate("department")
          .populate("roleType")
          .populate("team");
        logger.info(
          `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res.status(200).json({
          data: result,
          message: "User Password Changed Successfully",
        });
      } else {
        logger.info(
          `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Client Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } else {
      logger.error(
        `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Client is not Autherized `
      );
      return res.status(401).send({ message: "User is not Autherized" });
    }
  } catch (error) {
    logger.error(
      `${ip}: API /api/v1/client/change/pass/:${id} | User: ${loggedin_user.name} | responnded with Error `
    );
    return res
      .status(500)
      .json({ data: error, message: "Something went wrong" });
  }
};

//@desc Update Client with id
//@route PUT /api/v1/client/update/document/:id
//@access Private: Needs Login
const updateDocument = async (req, res) => {
  const loggedin_user = req.user;
  const { id } = req.params;

  const data = matchedData(req);
  console.log("data: ", data, id);

  const errors = validationResult(req);
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!errors.isEmpty()) {
    logger.error(
      `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Validation Error `
    );
    return res.status(400).json({ errors: errors.array() });
  }

  if (loggedin_user) {
    try {
      const oldUser = await Client.findOne({ user_id: id });
      console.log("oldUser: ", oldUser);
      if (oldUser) {
        let client = "";

        if (data.document_type == "adhar") {
          const res = await Client.findOneAndUpdate(
            { user_id: id },
            {
              adhar_proof_url: data.document_url,
              adhar_proof: true,
              adhar_proof_url_id: data.document_url_id,
            },
            {
              new: true,
            }
          );
          client = res;
        }

        if (data.document_type == "pan") {
          const res = await Client.findOneAndUpdate(
            { user_id: id },
            {
              pan_proof_url: data.document_url,
              pan_proof: true,
              pan_proof_url_id: data.document_url_id,
            },
            {
              new: true,
            }
          );
          client = res;
        }

        if (data.document_type == "gst") {
          const res = await Client.findOneAndUpdate(
            { user_id: id },
            {
              gst_proof_url: data.document_url,
              gst_proof: true,
              gst_proof_url_id: data.document_url_id,
            },
            {
              new: true,
            }
          );
          client = res;
        }

        if (data.document_type == "cin") {
          const res = await Client.findOneAndUpdate(
            { user_id: id },
            {
              cin_proof_url: data.document_url,
              cin_proof: true,
              cin_proof_url_id: data.document_url_id,
            },
            {
              new: true,
            }
          );
          client = res;
        }

        logger.info(
          `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Success `
        );
        return res
          .status(200)
          .json({ data: client, message: "User Updated Successfully" });
      } else {
        logger.info(
          `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Client Not Found `
        );
        return res.status(200).json({ message: "User Not Found" });
      }
    } catch (error) {
      logger.error(
        `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Error `
      );
      return res
        .status(500)
        .json({ data: error, message: "Something went wrong" });
    }
  } else {
    logger.error(
      `${ip}: API /api/v1/client/update/:${id} | User: ${loggedin_user.name} | responnded with Client is not Autherized `
    );
    return res.status(401).send({ message: "User is not Autherized" });
  }
};

module.exports = {
  testClientAPI,
  createClient,
  updateCreated,
  AddClientDetails,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  updateDocument,

  getCurrent,
  AppDisClient,
  changePass,
};
