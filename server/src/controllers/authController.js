//controller's job is to read request validate input, call service, send response that's all.
const authenticate = require('../services/authService')

const authController = async (req, res) => {
    const response = await authenticate(req.body)
    res.status(response.status).json(response)
}

module.exports = authController
