const express = require('express');
const profileRouter = express.Router();
const User = require('../models/user')
const { userAuth } = require("../middlewares/auth")
const bcrypt = require("bcrypt");

const { validatePassword } = require('../utils/validation')

//Get user by email
//http://localhost:3000/user?emailID=abhishek.r@gmail.com
profileRouter.get("/user", async (req, res) => {
    const userMailID = req.query.emailID;
    console.log(userMailID)
    try {
        const user = await User.findOne({ emailID: userMailID });
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send(user);
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

//Delete user by ID
profileRouter.delete("/user/:userId", async (req, res) => {
    const userId = req.params.userId
    console.log('User Id', userId)
    try {
        //const user = await User.findOneAndDelete({ emailID: userEmail });
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send("User deleted successfully");
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


//Profile edit api/ password
profileRouter.put("/profile/edit", userAuth, async (req, res) => {

    const allowedData = ["skills", "about", "gender", "firstName", "lastName", "password","age","photoUrl"];

    const isUpdateAllowed = Object.keys(req.body).every((key) =>
        allowedData.includes(key));

    console.log("Eidt Values", req.body)
    try {
        const loggedInUser = req.user;
        if (!isUpdateAllowed) {
            throw new Error("Update is not allowed")
        } else {
            const updates = { ...req.body }
            if (updates.password) {
                validatePassword(req);
                updates.password = await bcrypt(updates.password, 10);
            }
            Object.assign(loggedInUser, updates);
        }

        await loggedInUser.save();

        res.json({ 'Message': "User Updated Successfully", data: loggedInUser });
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

//Profile api view//
profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR: " + err.message)
    }
})

module.exports = profileRouter;