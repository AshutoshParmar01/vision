const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { extractFaces } = require("../services/faceService");
const {
    recognizeFace
} = require("../services/recognizeService");

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

            const result = [];

            for (const face of faceData.faces) {

                const person =
                    await recognizeFace(
                        face.embedding,
                        req.email
                    );

                result.push({

                    bbox: face.bbox,

                    person

                });

            }

            res.json({

                faces: result

            });

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
