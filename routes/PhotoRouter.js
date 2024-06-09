const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken')
const multer = require("multer");
const path = require("path")

router.get("/photosOfUser/:id", verifyToken, async (request, response) => {
    const userId = request.params.id;
    const user = await User.findById(userId);
    if (!user) {
        return response.status(404).json({ message: 'User not found.' });
    }
    try {
        const photos = await Photo.find({ user_id: request.params.id });
        const photosRes = photos.map(async (photo) => {
            const comments = await Promise.all(photo.comments.map(async (comment) => {
                const commentUser = await User.findById(comment.user_id);
                return {
                    comment: comment.comment,
                    date_time: comment.date_time,
                    _id: comment._id,
                    user: {
                        _id: commentUser._id,
                        first_name: commentUser.first_name,
                        last_name: commentUser.last_name
                    },
                };
            }));
            const photoObj = photo.toObject();
            delete photoObj.__v;
            return {
                ...photoObj,
                comments
            }
        });
        const resolvedPhotos = await Promise.all(photosRes);
        response.send(resolvedPhotos);
    }
    catch (error) {
        response.status(400).send(error);
    }
});

router.post('/commentsOfPhoto/:photo_id', verifyToken, async (req, res) => {
    const photoId = req.params.photo_id;
    if (req.body.comment === null || req.body.comment === undefined || req.body.comment.length === 0) {
        res.status(400).send('Vui lòng nhập comment!');
        return;
    }
    const newComment = {
        comment: req.body.comment,
        user_id: req.body.user_id,
        date_time: new Date().toISOString()
    }
    try {
        const photoInfo = await Photo.findOne({ _id: photoId });
        if (!photoInfo) {
            res.status(400).send('Photo not found');
            return;
        }
        photoInfo.comments.push(newComment);
        await Photo.findOneAndUpdate({ _id: photoId }, { comments: photoInfo.comments }, { new: true });
        res.status(200).send('Comment successfully added.');
    } catch (err) {
        res.status(400).send(JSON.stringify(err));
    }
});

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
            cb(null, 'images');
        }
        else {
            cb(new Error('Not image'), false)
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
    }
});

const upload = multer({ storage: storage });

router.post('/new', upload.single('photo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    try {
        const newPhoto = await new Photo({
            file_name: req.file.filename,
            date_time: new Date().toISOString(),
            user_id: req.body.user_id,
            comments: []
        });

        await newPhoto.save();
        res.status(200).send('Photo uploaded successfully.');
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Error saving photo to database!');
    }
})

module.exports = router;
