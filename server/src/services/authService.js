const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = async (req) => {
    const { firstname, lastname, email, password } = req;

    try {
        const { data: existingUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        // Ignore "user not found" but handle all other errors
        if (error && error.code !== "PGRST116") {
            return {
                status: 500,
                message: error.message,
            };
        }

        if (existingUser) {

            const passwordMatched = await bcrypt.compare(
                password,
                existingUser.hashedpassword
            );

            if (!passwordMatched) {
                return {
                    status: 401,
                    message: "Incorrect password",
                };
            }

            const token = jwt.sign(
                {
                    email: existingUser.email,
                },
                JWT_SECRET,
                {
                    expiresIn: "1h",
                }
            );

            return {
                status: 200,
                message: "Login successful",
                token,
                user: existingUser,
            };
        }

        const hashedPassword = await bcrypt.hash(
            password,
            SALT_ROUNDS
        );

        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([
                {
                    email,

                    firstname: firstname,

                    lastname: lastname,

                    hashedpassword: hashedPassword,
                },
            ])
            .select()
            .single();

        if (insertError) {
            return {
                status: 500,
                message: insertError.message,
            };
        }

        const token = jwt.sign(
            {
                email: newUser.email,
            },
            JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        return {
            status: 200,
            message: "Signup successful",
            token,
            user: newUser,
        };

    } catch (err) {

        console.error(err);

        return {
            status: 500,
            message: "Internal Server Error",
        };
    }
};

module.exports = authenticate
