const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const randToken = require('rand-token');

var User = require('../models/user');
var refreshTokens = {};

exports.getUsers = (req, res) => {
    let result = {};
    let status = 200;
    User.find({}, {password:0}, (err, users) => {
        if(err){
            status = 500;
            result.error = err;
        }else{
            result.result = users;
        }
        result.status = status;
        res.status(status).send(result);
    })
}

exports.register = (req, res) => {
    let result = {};
    let status = 200;
    bcrypt.hash(req.body.password, 8, (err, hash) => {
        if(err){
            status = 500;
            result.error = err;
            result.status = status;
            res.status(status).send(result);
        }else{
            User.create({
                name: req.body.name,
                email: req.body.email, 
                password: hash
            }, (err, user) => {
                if(err){
                    status = 500;
                    result.error = err;
                }else{
                    result.result = user;
                }
                result.status = status;
                res.status(status).send(result);
            });
        }
    });
};

exports.login = (req, res) => {
    let result = {};
    let status = 200;
    User.findOne({email: req.body.email}, (err, user) => {
        if(err){
            status = 500;
            result.status = status;
            result.error = err;
            return res.status(status).send(result);
        }
        if(!user){
            status = 404;
            result.status = status;
            result.error = 'No user was found';
            return res.status(status).send(result);
        }

        bcrypt.compare(req.body.password, user.password, (err, valid) => {
            if(err){
                status = 500;
                result.error = err;
            }else{
                if(!valid){
                    status = 401;
                    result.error = 'Authentication error';
                }else{
                    var token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
                        expiresIn: 86400
                    });
                    var refreshToken = randToken.uid(256);
                    refreshTokens[refreshToken] = user.email;

                    result.auth = true;
                    result.token = token;
                    result.refreshToken = refreshToken;
                    result.result = user;
                }
            }
            result.status = status;
            return res.status(status).send(result);
        });
    });
};

exports.getById = (req, res) => {
    User.findById(req.params.id, {passowrd: 0}, (err, user) => {
        let result = {};
        let status = 200;
        if(err){
            result.error = err;
            status = 500;
        }else if(!user){
            result.error = 'User not found';
            status = 404;
        }else{
            result.result = user;
        }
        result.status = status;
        res.status(status).send(result);
    });
};

exports.delete = (req, res) => {
    User.findOneAndDelete({_id: req.params.id}, (err, user) => {
        let result = {};
        let status = 200;
        if(err){
            status = 500;
            result.error = err;
        }else if(!user){
            status = 404;
            result.error = 'User not found';
        }else{
            result.result = user;
            result.message = `User: ${user.name} was deleted`
        }
        result.status = status;
        res.status(status).send(result);
    });
};

exports.update = (req, res) => {
    User.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, (err, user) => {
        let result = {};
        let status = 200;
        
        if(err){
            status = 500;
            result.error = err;
        }else if(!user){
            status = 404;
            result.error = 'User not found';
        }else{
            result.result = user;
        }
        result.status = status;
        res.status(status).send(result);
    });
};

exports.refrescarToken = (req, res) => {
    let email = req.body.email;
    let refreshToken = req.body.refreshToken;
    let result = {};
    if(refreshToken && (refreshToken in refreshTokens) && (refreshTokens[refreshToken] == email)){
        User.findOne({email: req.body.email}, (err, user) => {
            if(err){
                result.status = 500;
                result.error = err;
                result.auth = false;
                return res.status(500).send(result);
            }
            if(!user){
                result.status = 404;
                result.auth = false;
                result.error = 'No user was found';
                return res.status(400).send(result);
            }
            var token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
                expiresIn: 86400
            });
            var newRefreshToken = randToken.uid(256);
            refreshTokens[newRefreshToken] = user.email;
            delete refreshTokens[refreshToken];
            result.status = 200;
            result.auth = true;
            result.token = token;
            result.refreshToken = newRefreshToken;
            res.status(200).send(result);
        });
    }else{
        result.status = 401;
        result.auth = false;
        result.error = 'Not valid token';
        res.status(401).send(result);
    }
};