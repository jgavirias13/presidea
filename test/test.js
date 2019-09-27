var should = require('should');
var request = require('supertest');
var app = require('../index.js');

describe('Basic test', () => {
  it('Debe responder 200 a peticion /', (done) => {
    request(app)
      .get('/')
      .expect('Content-type', /text/)
      .expect(200, done);
  });
});