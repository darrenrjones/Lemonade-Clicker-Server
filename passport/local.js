'use strict';

const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models');

const localStrategy = new LocalStrategy((username, password, done) => {  
  let user;
  
  User.findOne({ username })
    .then(results => {
      console.log("results: ", results);
      
      user = results;
      console.log("USER: ", user);
      
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
    })
    .then(() => {      
      
      return done(null, user, { success: true });
    })
    .catch(err => { 
      console.log('entered catch from local');
           
      if (err.reason === 'LoginError') {
        console.log('entered localStrategy err: ', err);
        
        return done(null, false, { success: false, message: err.message });
      }
      return done(err);
    });
});

module.exports = localStrategy;