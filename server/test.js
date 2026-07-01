const path = require("path");
const { extractFaces } = require("./src/services/faceService");

(async () => {
    try {

        const imagePath = path.resolve(
            __dirname,
            "../python/test.png"
        );

        const faces = await extractFaces(imagePath);

        console.log(faces);

    } catch (err) {
        console.error(err);
    }
})();