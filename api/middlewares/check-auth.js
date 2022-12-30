const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    //   getting the token from the headers
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, "secret");
    req.userData = decoded;
    next();
  } catch (err) {
    console.log("Auth Error : ", err.name);
    return res.status(401).json({
      message: "Auth Failed"
    });
  }
};
