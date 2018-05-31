'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


const WebSocket = require('ws');

const ws = new WebSocket('ws://locahost:8042');



const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const User = require('./models');

const app = express();

const userList = [
  {
  userName: "user2",
  pwd: "abc12345",
  currentCash: 435,
  clickValue: 1,
  employees: [
    {emp: 0},
    {trucks: 0},
    {planes: 0}
  ]
},
{
  userName: "user3",
  pwd: "abc12345",
  currentCash: 1005,
  clickValue: 1,
  employees: [
    {emp: 1},
    {trucks: 0},
    {planes: 0}
  ]
},
{
  userName: "user4",
  pwd: "abc12345",
  currentCash: 435001455,
  clickValue: 4,
  employees: [
    {emp: 5},
    {trucks: 3},
    {planes: 1}
  ]
}
];

app.use(express.json());

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


app.get('/api/users', (req, res, next) => {
  User.find()
    .then(results => res.json(results))
    .catch(err => next(err))
});

app.get('/api/users/:userName', (req, res, next) => {
  const { userName } = req.params;

  User.findOne({userName: userName})
    .then(result => {
      if(result){
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      console.log(err);
      
    });  
});

app.put('/api/users/:id', (req, res, next) => {
  const { id } = req.params;
    
  User.findByIdAndUpdate(id, req.body, {new:true})
    .then(user => {
      if(!user) return res.sendStatus(404);
      return res.json(user.toObject())
    })
    

})

app.post('/api/users', (req, res, next) => {
  const requiredFields = ['userName', 'password'];
  console.log('here is req.body: ',req.body);
  

  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['userName', 'password'];
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

  const trimmedFields = ['userName', 'password'];
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
    userName: {
      min: 1
    },
    password: {
      min: 8,
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

  let {userName, password, currentCash, careerCash, manualClicks, clickValue, assets} = req.body;

  return User.find({userName})
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
    })
    .then(() => {
      const newUser = {userName, password, currentCash, careerCash, manualClicks, clickValue, assets};
      
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.userName}`).json(result);
    })
    .catch(err => {
      if (err.code === '11000') {
        err = new Error('The username already exists');
        err.status = 400;
        
      }
      console.log(err);

      next(err);
    });

})

// wss.on('connection', function connection(ws) {
//   ws.on('message', function incoming(message) {
//     console.log('received: %s', message);
//   });

//   ws.send('something');
// });

ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function incoming(data) {
  console.log(data);
});




// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
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
