'use strict';

const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models');

const localStrategy = new LocalStrategy((username, password, done) => {  
  let user;
  
  User.findOne({ username })
    .then(results => {      
      user = results;      
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username'
        });
      }
      return user.validatePassword(password);
      
    })
    .then( isValid => {      
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }      
    })
    .then(() => {      
      
      return done(null, user, { success: true });
    })
    .catch(err => { 
      // console.log('entered catch from local');
           
      if (err.reason === 'LoginError') {
        // console.log('entered localStrategy err: ', err);
        
        return done(null, false, { success: false, message: err.message });
      }
      return done(err);
    });
});

module.exports = localStrategy;