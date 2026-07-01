const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const router = express.Router();

const supabase = require("../config/supabase");
const { extractFaces } = require("../services/faceService");
const authMiddleware = require("../middlewares/authMiddleware");

const upload = multer({
    storage: multer.memoryStorage()
});

router.post(
    "/upload",
    authMiddleware,
    upload.single("photo"),
    async (req, res) => {

        let tempPath = "";

        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded"
                });
            }

            const email = req.email;

            const extension = req.file.originalname
                .split(".")
                .pop();

            const filename =
                crypto.randomUUID() +
                "." +
                extension;

            // -----------------------------
            // Create uploads folder if needed
            // -----------------------------
            const uploadDir = path.join(
                __dirname,
                "../../uploads"
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {
                    recursive: true
                });
            }

            // -----------------------------
            // Save image temporarily
            // -----------------------------
            tempPath = path.join(
                uploadDir,
                filename
            );

            fs.writeFileSync(
                tempPath,
                req.file.buffer
            );

            // -----------------------------
            // Upload image to Supabase Storage
            // -----------------------------
            const { error: uploadError } =
                await supabase.storage
                    .from("pxephotos")
                    .upload(
                        filename,
                        req.file.buffer,
                        {
                            contentType:
                                req.file.mimetype
                        }
                    );

            if (uploadError) {
                throw uploadError;
            }

            // -----------------------------
            // Get Public URL
            // -----------------------------
            const { data: publicData } =
                supabase.storage
                    .from("pxephotos")
                    .getPublicUrl(filename);

            const publicUrl =
                publicData.publicUrl;

            // -----------------------------
            // Insert into photos table
            // -----------------------------
            const {
                data: photo,
                error: dbError
            } = await supabase
                .from("photos")
                .insert({
                    email,
                    url: publicUrl
                })
                .select()
                .single();

            if (dbError) {
                throw dbError;
            }

            // -----------------------------
            // Extract faces using Python
            // -----------------------------
            const faceData = await extractFaces(tempPath);

            console.log("\n========== FACE DATA ==========");
            console.log(faceData);
            console.log("===============================\n");

            // Store every detected face
            for (const face of faceData.faces) {

                // -----------------------------
                // Create a new person
                // -----------------------------
                const {
                    data: person,
                    error: personError
                } = await supabase
                    .from("people")
                    .insert({
                        email,
                        representative_embedding: face.embedding
                    })
                    .select()
                    .single();

                if (personError) {
                    throw personError;
                }

                console.log("Created Person:", person.id);

                // -----------------------------
                // Insert detected face
                // -----------------------------
                const {
                    error: faceError
                } = await supabase
                    .from("faces")
                    .insert({

                        photo_id: photo.id,

                        person_id: person.id,

                        email,

                        bbox: face.bbox,

                        embedding: face.embedding

                    });

                if (faceError) {
                    throw faceError;
                }

                console.log("Stored Face");
            }
            // ----------------------------------------------------
            // NEXT STEP:
            // Insert into people and faces tables here.
            // ----------------------------------------------------

            res.json({
                message: "Upload successful",
                url: publicUrl,
                facesDetected: faceData.count
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                message: "Internal Server Error",
                error: err.message || err
            });

        } finally {

            if (
                tempPath &&
                fs.existsSync(tempPath)
            ) {
                fs.unlinkSync(tempPath);
            }

        }

    }
);

router.get(
    "/feed",
    authMiddleware,
    async (req, res) => {

        try {

            const email = req.email;

            const {
                data,
                error
            } = await supabase
                .from("photos")
                .select("*")
                .eq("email", email)
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                throw error;
            }

            res.json(data);

        } catch (err) {

            console.error(err);

            res.status(500).json({
                message: "Internal Server Error",
                error: err.message || err
            });

        }

    }
);

module.exports = router;
