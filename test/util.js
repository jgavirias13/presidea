let User = require('../app/models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createUser = (user, callback) => {
    let newUser = new User(user);
    bcrypt.hash(user.password, 8, (err, hash) => {
        newUser.password = hash;
        newUser.save((err, res) => {
            var token = jwt.sign({id: res._id}, process.env.JWT_SECRET, {
                expiresIn: 86400
            });
            res.token = `Baerer ${token}`;
            callback(res);
        });
    });
};