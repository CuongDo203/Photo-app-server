const express = require("express");
const Users = require("../db/userModel");
const router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Users.findOne({ username: username});
        if(!user) {
            res.status(400).send('Không tìm thấy người dùng');
            return;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword) {
            res.status(400).send('Mật khẩu không chính xác');
            return;
        }
        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 * 24 });
        res.header('auth-token', token).status(200).send({
            _id: user._id, first_name: user.first_name, last_name: user.last_name
            , token: token
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.post("/logout", async (req, res) => {
    // Lấy token từ header Authorization
    const token = req.headers['authorization'];

    // Kiểm tra xem token có tồn tại hay không
    if (!token) {
        return res.status(400).send('Bad Request: Người dùng hiện không đăng nhập');
    }
    res.status(200).send('Đã đăng xuất thành công');
})

module.exports = router