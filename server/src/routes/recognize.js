const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { extractFaces } = require("../services/faceService");

const upload = multer({
    storage: multer.memoryStorage()
});

router.post(
    "/",
    authMiddleware,
    upload.single("photo"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    message: "No frame received"
                });

            }

            const uploadDir = path.join(
                __dirname,
                "../../uploads"
            );

            if (!fs.existsSync(uploadDir)) {

                fs.mkdirSync(uploadDir, {
                    recursive: true
                });

            }

            const filename =
                crypto.randomUUID() + ".jpg";

            const tempPath =
                path.join(
                    uploadDir,
                    filename
                );

            fs.writeFileSync(
                tempPath,
                req.file.buffer
            );

            const faceData =
                await extractFaces(tempPath);

            fs.unlinkSync(tempPath);

            res.json(faceData);

        }
        catch (err) {

            console.log(err);

            res.status(500).json({
                message: "Internal Server Error"
            });

        }

    }
);

module.exports = router;
