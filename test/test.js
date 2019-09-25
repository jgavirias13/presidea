var request = require('supertest');
var app = require('../index.js');

describe('GET /', () => {
  it('respond with hello world', (done) => {
    request(app).get('/').expect('Hello world', done);
  });
});
