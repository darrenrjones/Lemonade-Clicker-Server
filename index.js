'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// const jwt = require('jsonwebtoken');

// const  { JWT_SECRET, JWT_EXPIRY } = require('./config');
const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');


const User = require('./models');

const app = express();
const authRouter = require('./routes/auth');

//parse request body
app.use(express.json());

passport.use(localStrategy);
passport.use(jwtStrategy);


// const options = {session:false, failWithError: true}

// function createAuthToken (user) {  
//   return jwt.sign({ user }, JWT_SECRET, {
//     subject: user.username,
//     expiresIn: JWT_EXPIRY
//   });
// }
const localAuth = passport.authenticate('local', {session: false});

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);
app.use('/api/auth', authRouter);
app.use('/api/users', authRouter);


//endpoints:

app.get('/api/users/:username', (req, res, next) => {
  const { username } = req.params;
  
  User.findOne({ username })
    .then(user => res.json(user))
    .catch(err => next(err))
});

app.get('/api/users', (req, res, next) => {
  User.find()
    .then(results => res.json(results))
    .catch(err => next(err))
});


//save endpoint
app.put('/api/users/:id', (req, res, next) => {
  const { id } = req.params;

  User.findByIdAndUpdate(id, req.body, {new:true})
    .then(user => {
      if(!user) return res.sendStatus(404);      
      return res.json(user.toObject());
    });    

});

// //register new user endpoint
// app.post('/api/users/register', (req, res, next) => { //can remove register part just /users
//   const requiredFields = ['username', 'password'];  

//   const missingField = requiredFields.find(field => !(field in req.body));

//   if (missingField) {    
//     const err = new Error(`Missing '${missingField}' in request body`);
//     err.status = 422;
//     return next(err);
//   }

//   const stringFields = ['username', 'password'];
//   const nonStringField = stringFields.find(
//     field => field in req.body && typeof req.body[field] !== 'string'
//   );

//   if(nonStringField){
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: 'Incorrect field type: expected string',
//       location: nonStringField
//     });
//   }

//   const trimmedFields = ['username', 'password'];
//   const nonTrimmedField = trimmedFields.find(
//     field => req.body[field].trim() !== req.body[field]);

//   if(nonTrimmedField) {
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: 'Cannot start or end with whitespace',
//       location: nonTrimmedField
//     });
//   }
//   const fieldSizes = {
//     username: {
//       min: 1
//     },
//     password: {
//       min: 6,
//       max: 72
//     }
//   };
//   const tooSmallField = Object.keys(fieldSizes).find(
//     field =>
//       'min' in fieldSizes[field] &&
//             req.body[field].trim().length < fieldSizes[field].min
//   );
//   const tooLargeField = Object.keys(fieldSizes).find(
//     field =>
//       'max' in fieldSizes[field] &&
//             req.body[field].trim().length > fieldSizes[field].max
//   );

//   if (tooSmallField || tooLargeField) {
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: tooSmallField
//         ? `Must be at least ${fieldSizes[tooSmallField]
//           .min} characters long`
//         : `Must be at most ${fieldSizes[tooLargeField]
//           .max} characters long`,
//       location: tooSmallField || tooLargeField
//     });
//   }

//   let {username, password, currentCash, careerCash, manualClicks, clickValue, assets, upgrades, seenMessage} = req.body;

//   return User.find({username})
//     .count()
//     .then(count => {
//       if(count > 0) {
//         return Promise.reject({
//           code: 422,
//           reason: 'ValidationError',
//           message: 'Username already taken',
//           location: 'username'
//         });
//       }
//       return User.hashPassword(password);
//     })
//     .then((digest) => {
//       const newUser = {username, password: digest, currentCash, careerCash, manualClicks, clickValue, assets, upgrades, seenMessage};
//       return User.create(newUser);
//     })
//     .then(result => {
//       return res.status(201).location(`/api/users/${result.username}`).json(result);
//     })
//     .catch(err => {      
//       if (err.code === 11000) {
//         err = new Error('The username already exists');
//         err.status = 400;        
//       }
//       next(err);
//     });

// });

// Catch-all Error handler
app.use(function (err, req, res, next) {
  res.status(err.code || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
