const express = require("express");
const User = require("../models/User");
const fetchUser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const bycrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Route-1: Creating a user using POST path: "/api/auth/createUser" (Login is not required)
router.post(
  "/createUser",
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists" });
      }
      const result = validationResult(req);
      if (result.isEmpty()) {
        //Generating Salt and Hash for the password instead of storing plain password
        const salt = await bycrypt.genSalt();
        const secPass = await bycrypt.hash(req.body.password, salt);

        const user = await User.create({
          name: req.body.name,
          password: secPass,
          email: req.body.email,
        });
        const data = {
          user: {
            id: user.id,
          },
        };
        const authToken = jwt.sign(data, process.env.JWT_key);
        res.json({ success: true, authtoken: authToken });
      } else {
        res.send({ success: false, errors: result.array() });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error");
    }
  }
);

// Route-2: Authenticating the user using POST path: "/api/auth/loginUser" (Login is not required)
router.post("/loginUser", [body("email").isEmail()], async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      //Takig the email and password from body
      const { email, password } = req.body;

      try {
        //finding the user to find a user in the database based on their email address
        const user = await User.findOne({ email });
        if (!user) {
          return res
            .status(400)
            .json({ error: "please enter the correct credentials" });
        }
        // compairing the password provided by the user with the hashed password stored in the user document retrieved from the database
        const passCompare = await bycrypt.compare(password, user.password);
        if (!passCompare) {
          return res
            .status(400)
            .json({ error: "please enter the correct credentials" });
        }

        const payload = {
          user: {
            id: user.id,
          },
        };

        //we are using user id to authenticate
        const authToken = jwt.sign(payload, process.env.JWT_key);
        res.json({ success: true, authtoken: authToken });
      } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
      }
    } else {
      res.send({ errors: result.array() });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

// Route-3: Get logged in user data using POST path: "/api/auth/getUser" (Login is required)
router.post("/getUser", fetchUser, async (req, res) => {
  try {
    //finding the user to find a user in the database based on their email address
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
