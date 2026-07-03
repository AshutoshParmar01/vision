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


//ALBUM CREATION AND MANAGEMENT ROUTES


// 1. Create a new album and link selected photos
router.post(
    "/albums",
    authMiddleware,
    async (req, res) => {
        try {
            const email = req.email;
            const { name, photoIds, musicUrl } = req.body;

            // Validate that we have a name and at least one photo selected
            if (!name || !photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
                return res.status(400).json({
                    message: "Album name and at least one selected photo are required."
                });
            }

            // Fallback default royalty-free music if none is provided
            const defaultMusic = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";
            const finalMusicUrl = musicUrl || defaultMusic;

            // Insert new album details
            const { data: album, error: albumError } = await supabase
                .from("albums")
                .insert({
                    name,
                    email,
                    music_url: finalMusicUrl
                })
                .select()
                .single();

            if (albumError) throw albumError;

            // Link the selected photos to the new album
            const links = photoIds.map(photoId => ({
                album_id: album.id,
                photo_id: photoId
            }));

            const { error: linkError } = await supabase
                .from("album_photos")
                .insert(links);

            if (linkError) throw linkError;

            res.json({
                message: "Album created successfully",
                album
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal Server Error",
                error: err.message || err
            });
        }
    }
);

// 2. Get all albums for the logged-in user
router.get(
    "/albums",
    authMiddleware,
    async (req, res) => {
        try {
            const email = req.email;

            // Fetch all albums owned by the user
            const { data: albumsData, error: albumsError } = await supabase
                .from("albums")
                .select("*")
                .eq("email", email)
                .order("created_at", { ascending: false });

            if (albumsError) throw albumsError;

            // For each album, calculate photo count and fetch first photo's URL as cover
            const albumsWithDetails = await Promise.all(
                albumsData.map(async (album) => {
                    const { data: photoLinks, error: linksError } = await supabase
                        .from("album_photos")
                        .select("photo_id")
                        .eq("album_id", album.id);

                    if (linksError) throw linksError;

                    const photoCount = photoLinks.length;
                    let coverUrl = "";

                    if (photoCount > 0) {
                        const { data: photo, error: photoError } = await supabase
                            .from("photos")
                            .select("url")
                            .eq("id", photoLinks[0].photo_id)
                            .single();
                        
                        if (!photoError && photo) {
                            coverUrl = photo.url;
                        }
                    }

                    return {
                        ...album,
                        photoCount,
                        coverUrl
                    };
                })
            );

            res.json(albumsWithDetails);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal Server Error",
                error: err.message || err
            });
        }
    }
);

// 3. Get photos inside a specific album (for the slideshow player)
router.get(
    "/albums/:albumId",
    authMiddleware,
    async (req, res) => {
        try {
            const { albumId } = req.params;

            // Fetch album details
            const { data: album, error: albumError } = await supabase
                .from("albums")
                .select("*")
                .eq("id", albumId)
                .single();

            if (albumError) throw albumError;

            // Fetch photo IDs linked to the album
            const { data: links, error: linksError } = await supabase
                .from("album_photos")
                .select("photo_id")
                .eq("album_id", albumId);

            if (linksError) throw linksError;

            const photoIds = links.map(l => l.photo_id);

            if (photoIds.length === 0) {
                return res.json({
                    album,
                    photos: []
                });
            }

            // Fetch photo records using those IDs
            const { data: photos, error: photosError } = await supabase
                .from("photos")
                .select("*")
                .in("id", photoIds);

            if (photosError) throw photosError;

            res.json({
                album,
                photos
            });
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
