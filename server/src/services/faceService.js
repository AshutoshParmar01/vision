const { spawn } = require("child_process");
const path = require("path");

function extractFaces(imagePath) {
    return new Promise((resolve, reject) => {

        // Absolute path to extract_faces.py
        const scriptPath = path.resolve(
            __dirname,
            "../../../python/services/extract_faces.py"
        );

        // Absolute path to the image
        const absoluteImagePath = path.resolve(imagePath);

        console.log("Python Script :", scriptPath);
        console.log("Image Path    :", absoluteImagePath);

        const python = spawn("python", [
            scriptPath,
            absoluteImagePath
        ]);

        let output = "";
        let error = "";

        python.stdout.on("data", (data) => {
            output += data.toString();
        });

        python.stderr.on("data", (data) => {
            error += data.toString();
        });

        python.on("close", (code) => {

            if (code !== 0) {
                return reject(error);
            }

            try {
                const marker = "===JSON_START===";

                const idx = output.indexOf(marker);

                if (idx === -1) {
                    return reject("JSON marker not found");
                }

                const json = output
                    .slice(idx + marker.length)
                    .trim();

                resolve(JSON.parse(json));
            } catch (err) {
                reject(err);
            }
        });

    });
}

module.exports = {
    extractFaces
};
