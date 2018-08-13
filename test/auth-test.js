'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const User = require('../models');
// const seedUsers = require('../DB/seed/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Auth', () => {

  let token;
  const username = 'example';
  const password = 'password';
  const _id = '333333333333333333333333';
  const username2 = 'example2';

  // this.timeout(5000);
  before(function () {
    return mongoose.connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.hashPassword(password)
      .then(digest => User.create({
        _id,
        username,
        password: digest
      }));
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase()
      .catch(err => console.error(err));
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('POST /login', () => {
    it('Should return a jwt auth token', () => {
      return chai.request(app)
        .post('/login')
        .send({ username, password})
        .then(res => {
          expect(res).to.have.status(200);
          // expect(res.body).to.be.an('object');
          // expect(res.body.authToken).to.be.a('string');

          // const payload = jwt.verify(res.body.authToken, JWT_SECRET);

          // expect(payload.user).to.not.have.property('password');
          // expect(payload.user).to.deep.equal({ id: _id, username, head: 0, list: [] });
        });
    });
  });






});