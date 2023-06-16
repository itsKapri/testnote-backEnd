const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {

  //we are requesting auth-token from the header
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .send({ error: "Please Authenticate using a valid token" });
  }

  try {
    //verifying the JWT token
    const data = jwt.verify(token, process.env.JWT_key);
    req.user = data.user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "Please Authenticate using a valid token" });
  }
};

module.exports = fetchUser;
