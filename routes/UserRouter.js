const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken')

router.get("/list", verifyToken,async (request, response) => {
    try {
        const users = await User.find({})
        const usersRes = users.map(user => ({ _id: user._id, first_name: user.first_name, last_name: user.last_name }))
        response.send(usersRes)
    }
    catch (error) {
        response.status(400).send({ error })
    }
});

router.get("/:id", verifyToken,async (request, response) => {
    try {
        const user = await User.findOne({ _id: request.params.id })
        const userRes = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location,
            description: user.description,
            occupation: user.occupation
        }
        response.send(userRes);
    }
    catch (error) {
        response.status(400).send(error)
    }
});

module.exports = router;