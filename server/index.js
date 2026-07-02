const express = require('express')
const cors = require('cors')
const authRoutes = require("./src/routes/auth");
const uploadRoutes = require("./src/routes/upload");
const avatarRoutes = require("./src/routes/avatar")
const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/photo", uploadRoutes);
app.use("/api/avatars", avatarRoutes);

app.listen(5000, () => {
    console.log("server running on port 5000")
});
