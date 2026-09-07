const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("authorization"); //getting the authorization header

  if (!authHeader) {
    return res.status(401).json({
      message: "Not Authenticated",
    });
  }

  const token = authHeader.split(" ")[1]; //extracting the bearer token

  let decodedtoken;

  try {
    decodedtoken = jwt.verify(token, process.env.JWT_SECRET); //verification
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or Expired token",
    });
  }
  if (!decodedtoken) {
    return res.status(401).json({
      message: "Not Authenticated",
    });
  }
  req.adminId = decodedtoken.adminId; //getadminId and store it in the request object

  next();
};
