//controller's job is to read request validate input, call service, send response that's all.
const authenticate = require('../services/authService')
const profile = require('../services/profileService')

const authController = async (req, res) => {
    const response = await authenticate(req.body)
    res.status(response.status).json(response)
}

const profileLoader = async(req, res) => {
    const response = await profile(req)
    res.status(response.status).json(response)
}

module.exports = {
    authController,
    profileLoader
}
