const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const os = require("os");        // <-- MAKE SURE THIS LINE IS PRESENT
const axios = require("axios");  // <-- MAKE SURE THIS LINE IS PRESENT

// FFmpeg dependencies (MAKE SURE THESE 3 LINES ARE HERE)
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

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
            const defaultMusic = "https://toefuqgmlgibecpdhri.supabase.co/storage/v1/object/public/Music/calm%20background.mp3";
            const finalMusicUrl = (musicUrl === undefined || musicUrl === null) ? defaultMusic : musicUrl;

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

// 4. Generate a rendered slideshow video of the album with background music (FFmpeg backend compilation)
router.get(
    "/albums/:albumId/video",
    authMiddleware,
    async (req, res) => {
        const { albumId } = req.params;
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `slideshow-${albumId}-`));
        try {
            // Fetch album details from Supabase database
            const { data: album, error: albumError } = await supabase
                .from("albums")
                .select("*")
                .eq("id", albumId)
                .single();
            if (albumError || !album) {
                throw albumError || new Error("Album not found");
            }
            // Fetch photo IDs linked to the album
            const { data: links, error: linksError } = await supabase
                .from("album_photos")
                .select("photo_id")
                .eq("album_id", albumId);
            if (linksError) throw linksError;
            const photoIds = links.map(l => l.photo_id);
            if (photoIds.length === 0) {
                return res.status(400).json({
                    message: "Album is empty and cannot be compiled into a video."
                });
            }
            // Fetch photo records using those IDs
            const { data: photos, error: photosError } = await supabase
                .from("photos")
                .select("*")
                .in("id", photoIds);
            if (photosError) throw photosError;
            // Download photos to server's temporary directory
            const imagePaths = [];
            for (let i = 0; i < photos.length; i++) {
                const imgPath = path.join(tempDir, `img_${i.toString().padStart(3, "0")}.jpg`);
                const response = await axios({ url: photos[i].url, responseType: "stream" });
                const writer = fs.createWriteStream(imgPath);

                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                });
                imagePaths.push(imgPath);
            }
            // Download background music if present
            let audioPath = null;
            if (album.music_url) {
                audioPath = path.join(tempDir, "audio.mp3");
                const audioResponse = await axios({ url: album.music_url, responseType: "stream" });
                const audioWriter = fs.createWriteStream(audioPath);

                audioResponse.data.pipe(audioWriter);
                await new Promise((resolve, reject) => {
                    audioWriter.on("finish", resolve);
                    audioWriter.on("error", reject);
                });
            }
            // Generate demuxer text file list for FFmpeg (each photo is shown for 4 seconds)
            let concatContent = "";
            imagePaths.forEach((imgPath) => {
                const escapedPath = imgPath.replace(/\\/g, "/");
                concatContent += `file '${escapedPath}'\nduration 4.0\n`;
            });
            // Repeat the last image once more as per FFmpeg concat demuxer specification
            const lastEscapedPath = imagePaths[imagePaths.length - 1].replace(/\\/g, "/");
            concatContent += `file '${lastEscapedPath}'\n`;
            const concatTxtPath = path.join(tempDir, "input.txt");
            fs.writeFileSync(concatTxtPath, concatContent);

            // Setup output path and configure FFmpeg command
            const outputVideoPath = path.join(tempDir, "output.mp4");

            let command = ffmpeg()
                .input(concatTxtPath)
                .inputOptions(["-f concat", "-safe 0"])
                .outputOptions([
                    "-c:v libx264",      // H.264 video codec
                    "-pix_fmt yuv420p",  // standard YUV pixel format
                    "-r 25",             // Output Frame rate (25fps)
                    // Auto-scale & pad images to 1280x720 aspect ratio letterbox/pillarbox
                    "-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black"
                ]);
            if (audioPath) {
                command = command
                    .input(audioPath)
                    .outputOptions([
                        "-c:a aac",      // AAC audio codec
                        "-b:a 192k",     // audio bitrate
                        "-shortest"      // truncate video output when slides end
                    ]);
            }

            // Detect if client cancels the request
            let cancelled = false;

            req.on("close", () => {

                if (cancelled) return;

                cancelled = true;

                console.log("Client cancelled video download.");

                try {
                    command.kill("SIGKILL");
                } catch (err) {
                    console.log("FFmpeg was already stopped.");
                }

                try {
                    fs.rmSync(tempDir, {
                        recursive: true,
                        force: true
                    });
                    console.log("Temporary files deleted.");
                } catch (err) {
                    console.log("Could not delete temp directory.");
                }

            });
            command
                .save(outputVideoPath)
                .on("end", () => {
                    if (cancelled) return;

                    res.setHeader("Content-Type", "video/mp4");
                    res.setHeader("Content-Disposition", `attachment; filename="${album.name}.mp4"`);

                    res.sendFile(outputVideoPath, () => {
                        // Cleanup temp folder after download completes
                        fs.rmSync(tempDir, { recursive: true, force: true });
                    });
                })
                .on("error", (err) => {
                    if (cancelled) return;

                    console.error("FFmpeg error:", err);

                    res.status(500).json({
                        message: "Failed to compile slideshow video."
                    });

                    try {
                        fs.rmSync(tempDir, {
                            recursive: true,
                            force: true
                        });
                    } catch { }
                });
        } catch (error) {
            console.error("Video creation endpoint failed:", error);
            res.status(500).json({ message: "Internal Server Error during video generation." });
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (_) { }
        }
    }
);

module.exports = router;
