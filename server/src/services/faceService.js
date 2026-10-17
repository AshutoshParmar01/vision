const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function resolvePython() {
    // 1. Explicit override (set in docker-compose / Dockerfile)
    if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
        return process.env.PYTHON_PATH;
    }
    // 2. Linux venv (docker)
    const linuxVenv = path.resolve(__dirname, "../../../python/venv/bin/python");
    if (fs.existsSync(linuxVenv)) {
        return linuxVenv;
    }
    // 3. Windows venv (local dev)
    const winVenv = path.resolve(__dirname, "../../../python/venv/Scripts/python.exe");
    if (fs.existsSync(winVenv)) {
        return winVenv;
    }
    // 4. Fallback to system python
    return "python3";
}

function extractFaces(imagePath) {
    return new Promise((resolve, reject) => {

        // Virtual Environment Python (cross-platform: docker + windows + system fallback)
        const pythonExecutable = resolvePython();

        // Python Script
        const scriptPath = path.resolve(
            __dirname,
            "../../../python/services/extract_faces.py"
        );

        // Uploaded Image
        const absoluteImagePath = path.resolve(imagePath);

        console.log("Python Executable :", pythonExecutable);
        console.log("Python Script     :", scriptPath);
        console.log("Image Path        :", absoluteImagePath);

        const python = spawn(
            pythonExecutable,
            [
                scriptPath,
                absoluteImagePath
            ]
        );

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
                    console.log(output);
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
