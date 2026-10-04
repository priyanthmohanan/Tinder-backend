const express = require('express');
const authRouter = express.Router();
const { validateSignUpData } = require('../utils/validation');
const bcrypt = require("bcrypt");
const User = require('../models/user');


//Login User
authRouter.post("/login", async (req, res) => {

    try {
        console.log("Login credentials", req.body)
        const { emailID, password } = req.body;
        const user = await User.findOne({ emailID: emailID })
        if (!user) {
           return res.status(400).send("Invalid credentials");
        }
        const isPasswordvalid = await user.validatePassword(password);

        if (isPasswordvalid) {

            const token = await user.getJWT();

            res.cookie("token", token, {
                expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now cookie will be removed
                httpOnly: true
            });

            res.json({ message: "Login Successfull", user })
        } else {
           return res.status(400).send("Invalid credentials");
        }

    } catch (err) {
       return res.status(400).send("Error: " + err.message);
    }
});

// Adding a new usesr
authRouter.post("/signup", async (req, res) => {

    try {
        validateSignUpData(req);
        const { firstName, lastName, emailID, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10)
        console.log("Hashed Password", passwordHash)
        const user = new User(
            {
                firstName,
                lastName,
                emailID,
                password: passwordHash
            }
        )
        const savedUser = await user.save();
        const token = await savedUser.getJWT();

        res.cookie("token", token, {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now cookie will be removed
            httpOnly: true
        });
        res.send({message:"User added successfully",savedUser})
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

//Logout User
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("Logout Successful");
});

module.exports = authRouter;