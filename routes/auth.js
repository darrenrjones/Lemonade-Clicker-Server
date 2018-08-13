
'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');


const passport = require('passport');
const localStrategy = require('../passport/local');
const jwtStrategy = require('../passport/jwt');

const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const User = require('../models');

const options = { session: false, failWithError: true };

const localAuth = passport.authenticate('local', options);


// router.post('/login', localAuth, function(req, res, next) {
//   console.log('hit login from auth.js');
  
//   passport.authenticate('local', options, function(err,user,response){
    
//     if (response.success){
//       const authToken = createAuthToken(user);      
//       return res.json({ authToken });  
//     } else if (!response.success) {      
//       res.status(401).json({
//         message: response.message
//       });
//     }
//   })(req,res,next);
// });

router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  return res.json({ authToken });
});

const jwtAuth = passport.authenticate('jwt', { session: false});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  return res.json({ authToken });
});
function createAuthToken (user) {  
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

//register new user endpoint
router.post('/register', (req, res, next) => { //can remove register part just /users
  const requiredFields = ['username', 'password'];  

  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {    
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if(nonStringField){
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const trimmedFields = ['username', 'password'];
  const nonTrimmedField = trimmedFields.find(
    field => req.body[field].trim() !== req.body[field]);

  if(nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }
  const fieldSizes = {
    username: {
      min: 1
    },
    password: {
      min: 6,
      max: 72
    }
  };
  const tooSmallField = Object.keys(fieldSizes).find(
    field =>
      'min' in fieldSizes[field] &&
            req.body[field].trim().length < fieldSizes[field].min
  );
  const tooLargeField = Object.keys(fieldSizes).find(
    field =>
      'max' in fieldSizes[field] &&
            req.body[field].trim().length > fieldSizes[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${fieldSizes[tooSmallField]
          .min} characters long`
        : `Must be at most ${fieldSizes[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, password, currentCash, careerCash, manualClicks, clickValue, assets, upgrades, seenMessage} = req.body;

  return User.find({username})
    .count()
    .then(count => {
      if(count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then((digest) => {
      const newUser = {username, password: digest, currentCash, careerCash, manualClicks, clickValue, assets, upgrades, seenMessage};
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.username}`).json(result);
    })
    .catch(err => {      
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;        
      }
      next(err);
    });

});


module.exports = router;