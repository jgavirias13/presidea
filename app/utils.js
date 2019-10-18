const jwt = require('jsonwebtoken');
const User = require('./models/user');

exports.verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    let result = {};
    if(!authorizationHeader){
        result.status = 403;
        result.auth = false;
        result.error = 'Authentication Error. Token required';
        return res.status(403).send(result);
    }

    const token = req.headers.authorization.split(' ')[1]
    const options = {
        expiresIn: 86400
    }
    
    jwt.verify(token, process.env.JWT_SECRET, options, (err, decoded) => {
        if(err){
            result.status = 500;
            result.auth = false;
            result.error = 'Failed to authenticate token';
            return res.status(500).send(result);
        }
        User.findById(decoded.id, (err, user) => {
            if(err || !user){
                result.status = 500;
                result.auth = false;
                result.error = 'Failed to authenticate token';
                return res.status(500).send(result);
            }else{
                req.userId = decoded.id;
                next();
            }
        })
    });
};