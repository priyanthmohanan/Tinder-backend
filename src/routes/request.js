const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require('../models/user')
const ConnectionRequest = require('../models/connectionRequest')



//Send connection request//
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    console.log(req.user)
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["interested", "ignored"]

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status : " + status })
    }

    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.status(400).send({ message: "User not found" })
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    })

    if (existingConnectionRequest) {
      return res.status(400).send({ message: "Connection request already exist" })
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status
    })

    console.log("New connectionRequest", connectionRequest)

    const data = await connectionRequest.save();
    return res.json({
      message: req.user.firstName + " " + status + " " + toUser.firstName,
      data
    })
  } catch (err) {
    res.status(400).send("ERROR from send request: " + err.message)
  }
});

//Review connection request//
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {

  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;
    const allowedStatus = ['accepted', 'rejected'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send('Invalid status ' + status);
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: 'interested'
    })

    if (!connectionRequest) {
      return res.status(404).send('Connection request not found');
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    return res.json({ message: 'Connection request ' + status, data })

  } catch (err) {
    res.status(400).send('ERROR' + err.message)
  }

});

//Feed API - GET all the users from the database
requestRouter.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return res.status(400).send("Error: " + err.message);
  }
});


module.exports = requestRouter;