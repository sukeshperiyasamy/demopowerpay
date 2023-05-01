const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

const User = require('./models/user'); // define user model
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});
// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// Serve the signup page
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ...

// Signup route
app.post('/signup', (req, res, next) => {
  // Check if email is already taken
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.send(`
          <h2>Email already exists</h2>
          <a href="/">Go back</a>
        `);
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
              // Redirect to dashboard.html
              res.redirect('/dashboard');
            })
            .catch(err => {
              console.log(err);
              res.send(`
                <h2>An error occurred</h2>
                <a href="/">Go back</a>
              `);
            });
        });
    });
});
// ...

// Login route
app.post('/login', (req, res, next) => {
  // Check if email exists
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.send(`
          <h2>Authentication failed</h2>
          <a href="/">Go back</a>
        `);
      }
      // Compare password hashes
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.send(`
            <h2>Authentication failed</h2>
            <a href="/">Go back</a>
          `);
        }
        if (result) {
          // Redirect to dashboard.html
          res.redirect('/dashboard.html');
        } else {
          res.send(`
            <h2>Authentication failed</h2>
            <a href="/">Go back</a>
          `);
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.send(`
        <h2>An error occurred</h2>
        <a href="/">Go back</a>
      `);
    });
});

// ...

// Serve static files from the "public" directory


app.listen(4000, () => {
  console.log('Server listening on port 4000');
});
