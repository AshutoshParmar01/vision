const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/authMiddleware");

router.get(
    "/people/:personId/photos",
    authMiddleware,
    async (req, res) => {

        try {

            const personId = req.params.personId;

            // Step 1
            const {
                data: faces,
                error: faceError
            } =
            await supabase
                .from("faces")
                .select("photo_id")
                .eq("person_id", personId)
                .eq("email", req.email);

            if (faceError)
                throw faceError;

            if (!faces.length) {
                return res.json([]);
            }

            const photoIds =
                faces.map(face => face.photo_id);

            // Step 2
            const {
                data: photos,
                error: photoError
            } =
            await supabase
                .from("photos")
                .select("*")
                .in("id", photoIds)
                .order("created_at", {
                    ascending: false
                });

            if (photoError)
                throw photoError;

            res.json(photos);

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
