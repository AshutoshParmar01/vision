const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    console.log("inside middleware", req)    
    console.log(req.body)
    const authHeader  = req.headers.authorization
    console.log(authHeader)
    const authToken = authHeader.split(" ")[1]
    console.log(authToken)
    try {
        const decoded = jwt.verify(authToken, JWT_SECRET)
        if(decoded){
            req.email = decoded.email
            next()
        }else{
            res.json({
                message : "invalid token"
            })
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = authMiddleware
