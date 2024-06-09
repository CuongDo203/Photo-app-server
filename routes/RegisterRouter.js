const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const bcrypt = require("bcrypt")

router.post("/user", async (req, res) => {
    const { firstName, lastName, username, password, location, description, occupation } = req.body;
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
        res.status(400).send('Username đã tồn tại!');
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            first_name: firstName,
            last_name: lastName,
            username: username,
            password: hashedPassword,
            location: location || '',
            description: description || '',
            occupation: occupation || ''
        })
        await user.save();
        res.status(200).send('Thêm thành công!');
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
})

module.exports = router