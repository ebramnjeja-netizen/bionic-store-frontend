const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, upload.single("image"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No image uploaded."
        });
    }

    res.json({

        message: "Image uploaded successfully",

        imageUrl: `/uploads/products/${req.file.filename}`

    });

});

module.exports = router;