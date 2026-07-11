const supabase = require("../config/supabase");
const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware') 

router.get(
    "/people",
    authMiddleware,
    async (req, res) => {
        console.log("req reaching avatarjs")
        try {

            const { data, error } =
                await supabase
                    .from("people")
                    .select("id, avatar_url, name")
                    .eq("email", req.email);

            if (error) {
                throw error;
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

router.put(
    "/people/:personId",
    authMiddleware,
    async (req, res) => {

        try {

            const { personId } =
                req.params;

            const { name } =
                req.body;

            const { data, error } =
                await supabase
                    .from("people")
                    .update({
                        name
                    })
                    .eq("id", personId)
                    .eq("email", req.email)
                    .select()
                    .single();

            if (error)
                throw error;

            res.json(data);

        }
        catch (err) {

            console.log(err);

            res.status(500).json({
                message:
                "Internal Server Error"
            });

        }

    }
);

module.exports = router
