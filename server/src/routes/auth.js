//route only decides which controller handles this, that's it.
const express = require('express')
const router = express.Router()
const {authController,profileLoader} = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware') 

router.post('/signup', authController)
router.post('/login', authController)
router.get('/me', authMiddleware, profileLoader)

module.exports = router
