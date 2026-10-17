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

function cropFace(imagePath, bbox, outputPath) {

    return new Promise((resolve, reject) => {

        const pythonExecutable = resolvePython();

        const script = path.resolve(
            __dirname,
            "../../../python/services/crop_face.py"
        );

        const python = spawn(
            pythonExecutable,
            [
                script,
                imagePath,
                outputPath,
                bbox[0],
                bbox[1],
                bbox[2],
                bbox[3]
            ]
        );

        let error = "";

        python.stderr.on("data", (data) => {
            error += data.toString();
        });

        python.on("close", (code) => {

            if (code !== 0) {
                return reject(error);
            }

            resolve();

        });

    });

}

module.exports = {
    cropFace
};
