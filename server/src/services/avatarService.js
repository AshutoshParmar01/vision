const { spawn } = require("child_process");
const path = require("path");

function cropFace(imagePath, bbox, outputPath) {

    return new Promise((resolve, reject) => {

        const pythonExecutable = path.resolve(
            __dirname,
            "../../../python/venv/Scripts/python.exe"
        );

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
