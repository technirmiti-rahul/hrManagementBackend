const jwt = require("jsonwebtoken");
const logger = require("../config/logger.js");

const validateToken = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;

    const currentDate = new Date().toISOString().split("T")[0];

    const loginRestrictionDate = new Date("2025-10-28")
      .toISOString()
      .split("T")[0];
    if (currentDate <= loginRestrictionDate) {
      if (!authHeader) {
        return res.status(401).json({ message: "User token not found" });
      }

      if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECERT, (err, decoded) => {
          if (err) {
            //console.log(err);
            logger.info(
              `${ip}: API /api/v1/user/getCurrent responnded with the Error: No token`
            );
            return res
              .status(401)
              .json({ error: err, message: "User is not authorized" });
          }

          req.user = decoded.user;
          next();
        });

        if (!token) {
          return res.status(401).json({ message: "User is not authorized" });
        }
      }
    } else {
      return res.status(401).json({ message: "Login Not Allowed" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = validateToken;
