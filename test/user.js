process.env.NODE_ENV = 'test';

let User = require('../app/models/user');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();
const util = require('./util');

chai.use(chaiHttp);

let validUser = {
    name: 'Usuario test 1',
    email: 'test1@idea.com',
    password: '1234'
}

describe('Users', () => {
    //Clean data before tests
    beforeEach((done) => {
        User.deleteMany({}, (err) => {
            done();
        });
    });
 
    /*
     * Test the register -> POST /user
     */
    describe('/POST users', () => {
        it('it should not register a new user without a password', (done) => {
            let user = {
                name: 'Usuario test 0',
                email: 'test0@idea.com'
            };
            chai.request(server)
                .post('/api/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.have.property('error');
                    res.body.should.have.property('status');
                    res.body.status.should.be.eql(500);
                    done();
                });
        });
        it('it should not register a new user without a name', (done) => {
            let user = {
                email: 'test0@idea.com',
                password: '1234'
            };
            chai.request(server)
                .post('/api/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.have.property('error');
                    res.body.should.have.property('status');
                    res.body.status.should.be.eql(500);
                    res.body.error.should.have.property('name');
                    res.body.error.name.should.be.eql('ValidationError');
                    done();
                });
        });
        it('it should not register a new user without an email', (done) => {
            let user = {
                name: 'Usuario test 0',
                password: '1234'
            };
            chai.request(server)
                .post('/api/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.have.property('error');
                    res.body.should.have.property('status');
                    res.body.status.should.be.eql(500);
                    res.body.error.should.have.property('name');
                    res.body.error.name.should.be.eql('ValidationError');
                    done();
                });
        });
        it('it should register a new user and return the user object', (done) => {
            chai.request(server)
                .post('/api/users')
                .send(validUser)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('status');
                    res.body.should.have.property('result');
                    res.body.status.should.be.eql(200);
                    res.body.result.should.have.property('_id');
                    res.body.result.should.have.property('name');
                    res.body.result.should.have.property('email');
                    res.body.result.should.have.property('password');
                    res.body.result.name.should.be.eql(validUser.name);
                    res.body.result.email.should.be.eql(validUser.email);
                    done();
                });
        });
    });

    describe('/POST login', () => {
        it('it should not login if do not send the email', (done) => {
            let user = {
                password: validUser.password
            };
            chai.request(server)
                .post('/api/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('status');
                    res.body.should.have.property('error');
                    res.body.status.should.be.eql(404);
                    done();
                });
        });

        it('it should not login if do not send the password of an existing user', (done) => {
            util.createUser(validUser, (newUser) => {
                let user = {
                    email: newUser.email
                };
                chai.request(server)
                    .post('/api/login')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.body.should.have.property('status');
                        res.body.should.have.property('error');
                        res.body.status.should.be.eql(500);
                        done();
                    });
            });
        });

        it('it should not login if the password is incorrect', (done) => {
            util.createUser(validUser, (newUser) => {
                let user = {
                    email: newUser.email,
                    password: '123'
                };
                chai.request(server)
                    .post('/api/login')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(401);
                        res.body.should.have.property('status');
                        res.body.should.have.property('error');
                        res.body.status.should.be.eql(401);
                        res.body.error.should.be.eql('Authentication error');
                        done();
                    });
            })
        });

        it('it should login if the password is correct', (done) => {
            util.createUser(validUser, (newUser) => {
                let user = {
                    email: validUser.email,
                    password: validUser.password
                };
                chai.request(server)
                    .post('/api/login')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('status');
                        res.body.should.have.property('auth');
                        res.body.should.have.property('token');
                        res.body.should.have.property('refreshToken');
                        res.body.should.have.property('result');
                        res.body.status.should.be.eql(200);
                        res.body.auth.should.be.eql(true);
                        res.body.result.should.have.property('_id');
                        res.body.result.should.have.property('name');
                        res.body.result.should.have.property('email');
                        res.body.result.should.have.property('password');
                        done();
                    });
            });
        });
    });

    describe('/GET users', () => {
        it('it should return the list of all the users', (done) => {
            util.createUser(validUser, (newUser) => {
                chai.request(server)
                    .get('/api/users')
                    .set('Authorization', newUser.token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('status');
                        res.body.should.have.property('result');
                        res.body.status.should.be.eql(200);
                        res.body.result.should.be.a('array');
                        res.body.result.length.should.be.eql(1);
                        done();
                    });
            });
        });
    });

    describe('/GET user by id', () => {
        it('it should return a 404 if a not existing user was founded', (done) => {
            util.createUser(validUser, (newUser) => {
                let id = '111111111111111111111111';
                chai.request(server)
                    .get(`/api/users/${id}`)
                    .set('Authorization', newUser.token)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property('error');
                        res.body.should.have.property('status');
                        res.body.error.should.be.eql('User not found');
                        res.body.status.should.be.eql(404);
                        done();
                    });
            });
        });

        it('it should return a 500 if the id is malformed', (done) => {
            util.createUser(validUser, (newUser) => {
                let id = 'malformed';
                chai.request(server)
                    .get(`/api/users/${id}`)
                    .set('Authorization', newUser.token)
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.body.should.have.property('error');
                        res.body.should.have.property('status');
                        res.body.status.should.be.eql(500);
                        done();
                    });
            });
        });

        it('it should return the details of the user if the id exist', (done) => {
            util.createUser(validUser, (newUser) => {
                let id = newUser._id;
                chai.request(server)
                    .get(`/api/users/${id}`)
                    .set('Authorization', newUser.token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('result');
                        res.body.should.have.property('status');
                        res.body.status.should.be.eql(200);
                        res.body.result.should.have.property('_id');
                        res.body.result.should.have.property('name');
                        res.body.result.should.have.property('email');
                        res.body.result.name.should.be.eql(newUser.name);
                        res.body.result.email.should.be.eql(newUser.email);
                        done();
                    });
            });
        });
    });

    describe('/DELETE user by id', () => {
        it('it should return a 404 if the user does not exist', (done) => {
            util.createUser(validUser, (newUser) => {
                let id = '111111111111111111111111';
                chai.request(server)
                    .delete(`/api/users/${id}`)
                    .set('Authorization', newUser.token)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property('error');
                        res.body.should.have.property('status');
                        res.body.error.should.be.eql('User not found');
                        res.body.status.should.be.eql(404);
                        done();
                    });
            });
        });
        it('it should return a 500 if the sended id is malformed', (done) => {
            util.createUser(validUser, (newUser) => {
                let id = 'malformed';
                chai.request(server)
                    .delete(`/api/users/${id}`)
                    .set('Authorization', newUser.token)
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.should.have.property('error');
                        res.should.have.property('status');
                        res.body.status.should.be.eql(500);
                        done();
                    });
            });
        });
        it('it should delete the user if the id exists', (done) => {
            util.createUser(validUser, (newUser) => {
                let id = newUser._id;
                chai.request(server)
                    .delete(`/api/users/${id}`)
                    .set('Authorization', newUser.token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('result');
                        res.body.should.have.property('message');
                        res.body.should.have.property('status');
                        res.body.status.should.be.eql(200);
                        res.body.result.should.have.property('_id');
                        res.body.result.should.have.property('name');
                        res.body.result.should.have.property('email');
                        res.body.result.name.should.be.eql(newUser.name);
                        res.body.result.email.should.be.eql(newUser.email);
                        done();
                    });
            })
        });
    });

    describe('/PUT users', () => {
        it('it should return a 404 if the user was not found', (done) => {
            util.createUser(validUser, (newUser) => {
                let id = '111111111111111111111111';
                let update = {
                    email: 'testUpdated@idea.com'
                }
                chai.request(server)
                    .put(`/api/users/${id}`)
                    .set('Authorization', newUser.token)
                    .send(update)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property('error');
                        res.body.should.have.property('status');
                        res.body.error.should.be.eql('User not found');
                        res.body.status.should.be.eql(404);

                        done();
                    })
            });
        });

        it('it should return a 500 if the id is malformed', (done) => {
            util.createUser(validUser, (newUser) => {
                let id = 'malformed';
                let update = {
                    email: 'testUpdated@idea.com'
                }
                chai.request(server)
                    .put(`/api/users/${id}`)
                    .set('Authorization', newUser.token)
                    .send(update)
                    .end((err, res) => {
                        res.should.have.status(500);
                        res.body.should.have.property('error');
                        res.body.should.have.property('status');
                        res.body.status.should.be.eql(500);
                        res.body.error.should.have.property('name');
                        res.body.error.should.have.property('kind');
                        res.body.error.name.should.be.eql('CastError');
                        res.body.error.kind.should.be.eql('ObjectId');
                        done();
                    });
            });
        });

        it('it should return a 500 if the updated email is duplicated', (done) => {
            let secondUser = {
                name: 'Usuario test 2',
                email: 'test2@idea.com',
                password: '1234'
            }
            util.createUser(validUser, (newUser) => {
                let update = {
                    email: secondUser.email
                }
                util.createUser(secondUser, (new2User) => {
                    let id = newUser._id;
                    chai.request(server)
                        .put(`/api/users/${id}`)
                        .set('Authorization', newUser.token)
                        .send(update)
                        .end((err, res) => {
                            res.should.have.status(500);
                            res.body.should.have.property('error');
                            res.body.should.have.property('status');
                            res.body.status.should.be.eql(500);
                            res.body.error.should.have.property('name');
                            res.body.error.should.have.property('code');
                            res.body.error.should.have.property('codeName');
                            res.body.error.code.should.be.eql(11000)
                            res.body.error.name.should.be.eql('MongoError');
                            res.body.error.codeName.should.be.eql('DuplicateKey');
                            done();
                        })
                });
            });
        });

        it('it should update the email if the data is correct', (done) => {
            util.createUser(validUser, (newUser) => {
                let update = {
                    email: 'test2@idea.com'
                };
                chai.request(server)
                    .put(`/api/users/${newUser._id}`)
                    .set('Authorization', newUser.token)
                    .send(update)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('result');
                        res.body.should.have.property('status');
                        res.body.status.should.be.eql(200);
                        res.body.result.should.have.property('name');
                        res.body.result.should.have.property('email');
                        res.body.result.email.should.be.eql(update.email);
                        done();
                    });
            });
        });
    });

    describe('/POST refresh', () => {
        it('it should return Not Authorized if doesnt send the token', (done) => {
            util.createUser(validUser, (newUser) => {
                let data = {
                    email: 'test1@idea.com'
                };
                chai.request(server)
                    .post('/api/refresh')
                    .send(data)
                    .end((err, res) => {
                        res.should.have.status(401);
                        res.body.should.have.property('status');
                        res.body.should.have.property('auth');
                        res.body.should.have.property('error');
                        res.body.status.should.be.eql(401);
                        res.body.auth.should.be.eql(false);
                        res.body.error.should.be.eql('Not valid token');
                        done();
                    });
            });
        });

        it('it should return Not Authorized if the token is not valid', (done) => {
            util.createUser(validUser, (newUser) => {
                let data = {
                    email: 'test1@idea.com',
                    refreshToken: 'notValidToken'
                };
                chai.request(server)
                    .post('/api/refresh')
                    .send(data)
                    .end((err, res) => {
                        res.should.have.status(401);
                        res.body.should.have.property('status');
                        res.body.should.have.property('auth');
                        res.body.should.have.property('error');
                        res.body.status.should.be.eql(401);
                        res.body.auth.should.be.eql(false);
                        res.body.error.should.be.eql('Not valid token');
                        done();
                    });
            });
        });
    });
});
