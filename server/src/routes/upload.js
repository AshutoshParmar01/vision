const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const router = express.Router();

const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/authMiddleware");

const upload = multer({
    storage: multer.memoryStorage()
});

router.post(
    "/upload",
    authMiddleware,
    upload.single("photo"),
    async (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded"
                });
            }

            const email = req.email;

            const extension =
                req.file.originalname.split(".").pop();

            const filename =
                crypto.randomUUID() +
                "." +
                extension;

            const { error: uploadError } =
                await supabase.storage
                    .from("pxephotos")
                    .upload(filename, req.file.buffer, {
                        contentType: req.file.mimetype
                    });

            if (uploadError) {
                return res.status(500).json(uploadError);
            }

            const { data } =
                supabase.storage
                    .from("pxephotos")
                    .getPublicUrl(filename);

            const publicUrl =
                data.publicUrl;

            const { error: dbError } =
                await supabase
                    .from("photos")
                    .insert({
                        email,
                        url: publicUrl
                    });

            if (dbError) {
                return res.status(500).json(dbError);
            }

            res.json({
                message: "Upload successful",
                url: publicUrl
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({
                message: "Internal Server Error"
            });

        }

    }
);

router.get(
    "/feed",
    authMiddleware,
    async (req, res) => {

        try {

            const email = req.email;

            const { data, error } =
                await supabase
                    .from("photos")
                    .select("*")
                    .eq("email", email)
                    .order("created_at", {
                        ascending: false
                    });

            if (error) {
                return res.status(500).json(error);
            }

            res.json(data);

        } catch (err) {

            console.log(err);

            res.status(500).json({
                message: "Internal Server Error"
            });

        }

    }
);

module.exports = router;
