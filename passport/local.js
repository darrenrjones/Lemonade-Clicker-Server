'use strict';

const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models');

const localStrategy = new LocalStrategy((username, password, done) => {  
  let user;
  
  User.findOne({ username })
    .then(results => {
      console.log("results: ", results);
      
      user = results;
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username'
        });
      }
      console.log('password: ', password);

      return user.validatePassword(password);
      
    })
    .then( isValid => {
      console.log("ISVALID: ",isValid);
      
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }
      return done(null, user);
    })
    .catch(err => {      
      if (err.reason === 'LoginError') {
        console.log('entered proper reason: ', err);
        
        return done(null, false);
      }
      return done(err);
    });
});

module.exports = localStrategy;