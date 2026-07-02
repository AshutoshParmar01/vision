const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const router = express.Router();

const supabase = require("../config/supabase");
const { extractFaces } = require("../services/faceService");
const { findOrCreatePerson } = require("../services/personService");
const { cropFace } = require("../services/avatarService");
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
        let avatarPath = "";

        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded"
                });
            }

            const email = req.email;

            const extension =
                req.file.originalname
                    .split(".")
                    .pop();

            const filename =
                crypto.randomUUID() +
                "." +
                extension;

            // ------------------------------------
            // Temporary upload folder
            // ------------------------------------

            const uploadDir = path.join(
                __dirname,
                "../../uploads"
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {
                    recursive: true
                });
            }

            tempPath = path.join(
                uploadDir,
                filename
            );

            fs.writeFileSync(
                tempPath,
                req.file.buffer
            );

            // ------------------------------------
            // Upload original image
            // ------------------------------------

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

            if (uploadError)
                throw uploadError;

            const { data: publicData } =
                supabase.storage
                    .from("pxephotos")
                    .getPublicUrl(filename);

            const publicUrl =
                publicData.publicUrl;

            // ------------------------------------
            // Store photo
            // ------------------------------------

            const {
                data: photo,
                error: photoError
            } =
            await supabase
                .from("photos")
                .insert({
                    email,
                    url: publicUrl
                })
                .select()
                .single();

            if (photoError)
                throw photoError;

            // ------------------------------------
            // Detect faces
            // ------------------------------------

            const faceData =
                await extractFaces(tempPath);

            // ------------------------------------
            // Avatar folder
            // ------------------------------------

            const avatarDir = path.join(
                __dirname,
                "../../avatars"
            );

            if (!fs.existsSync(avatarDir)) {
                fs.mkdirSync(avatarDir, {
                    recursive: true
                });
            }

            // ------------------------------------
            // Process each face
            // ------------------------------------

            for (const face of faceData.faces) {

                const person =
                    await findOrCreatePerson(
                        face.embedding,
                        email
                    );
                    console.log("isNew =", person.isNew);

                // --------------------------------
                // Generate avatar only once
                // --------------------------------

                if (person.isNew) {

                    avatarPath = path.join(
                        avatarDir,
                        person.id + ".jpg"
                    );

                    await cropFace(
                        tempPath,
                        face.bbox,
                        avatarPath
                    );

                    const avatarBuffer =
                        fs.readFileSync(
                            avatarPath
                        );

                    const avatarName =
                        person.id + ".jpg";

                    const {
                        error: avatarUploadError
                    } =
                    await supabase.storage
                        .from("avatars")
                        .upload(
                            avatarName,
                            avatarBuffer,
                            {
                                contentType:
                                    "image/jpeg",
                                upsert: true
                            }
                        );

                    if (avatarUploadError)
                        throw avatarUploadError;

                    const {
                        data: avatarData
                    } =
                    supabase.storage
                        .from("avatars")
                        .getPublicUrl(
                            avatarName
                        );

                    await supabase
                        .from("people")
                        .update({
                            avatar_url:
                                avatarData.publicUrl
                        })
                        .eq(
                            "id",
                            person.id
                        );

                    fs.unlinkSync(
                        avatarPath
                    );

                }

                // --------------------------------
                // Store face
                // --------------------------------

                const {
                    error: faceError
                } =
                await supabase
                    .from("faces")
                    .insert({

                        photo_id:
                            photo.id,

                        person_id:
                            person.id,

                        email,

                        bbox:
                            face.bbox,

                        embedding:
                            face.embedding

                    });

                if (faceError)
                    throw faceError;

            }

            res.json({

                message:
                    "Upload successful",

                url:
                    publicUrl,

                facesDetected:
                    faceData.count

            });

        }
        catch (err) {

            console.error(err);

            res.status(500).json({

                message:
                    "Internal Server Error",

                error:
                    err.message || err

            });

        }
        finally {

            if (
                tempPath &&
                fs.existsSync(tempPath)
            ) {
                fs.unlinkSync(
                    tempPath
                );
            }

            if (
                avatarPath &&
                fs.existsSync(avatarPath)
            ) {
                fs.unlinkSync(
                    avatarPath
                );
            }

        }

    }
);

router.get(
    "/feed",
    authMiddleware,
    async (req, res) => {

        try {

            const email =
                req.email;

            const {
                data,
                error
            } =
            await supabase
                .from("photos")
                .select("*")
                .eq(
                    "email",
                    email
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error)
                throw error;

            res.json(data);

        }
        catch (err) {

            console.error(err);

            res.status(500).json({

                message:
                    "Internal Server Error",

                error:
                    err.message || err

            });

        }

    }
);

module.exports = router;
