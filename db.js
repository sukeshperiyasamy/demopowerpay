const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

const User = require('./models/user'); // define user model

// Signup route
app.post('/signup', (req, res, next) => {
  // Check if email is already taken
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.status(409).json({
          message: 'Email already exists'
        });
      }
      // Hash the password
      bcrypt.hash(req.body.password, 10)
        .then(hash => {
          const user = new User({
            email: req.body.email,
            password: hash
          });
          // Save user to database
          user.save()
            .then(result => {
              console.log(result);
              res.status(201).json({
                message: 'User created',
                user: {
                  email: result.email,
                  password: result.password
                }
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({
                error: err
              });
            });
        });
    });
});

// Login route
app.post('/login', (req, res, next) => {
  // Check if email exists
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Authentication failed'
        });
      }
      // Compare password hashes
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Authentication failed'
          });
        }
        if (result) {
          return res.status(200).json({
            message: 'Authentication successful'
          });
        }
        return res.status(401).json({
          message: 'Authentication failed'
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
