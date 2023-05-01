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




// Authentication middleware
const authenticateUser = (req, res, next) => {
  // Check if the user is logged in
  if (req.session.user) {
    // User is authenticated, proceed to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, redirect to the login page
    res.redirect('/login');
  }
};





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
app.get('/forgotpassword', (req, res) => {
  res.sendFile(__dirname + '/forgotpassword.html');
});

// ...

// Signup route
app.post('/signup', (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  // Check if email is already taken
  User.findOne({ email })
    .then(user => {
      if (user) {
        // Email already exists, redirect to login
        return res.redirect('/login');
      }

      // Create a new user
      const newUser = new User({
        email,
        password
      });

      // Save user to database
      newUser.save()
        .then(result => {
          // Redirect to dashboard
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




// Login route
app.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email exists
  User.findOne({ email })
    .then(user => {
      if (!user) {
        // User does not exist, redirect to signup
        return res.redirect('/signup');
      }

      // Compare password hashes
      bcrypt.compare(password, user.password)
        .then(result => {
          if (result) {
            // Password matches, redirect to the dashboard
            return res.redirect('/dashboard');
          } else {
            // Password does not match, redirect to login
            return res.send(`
              <h2>Invalid email or password</h2>
              <a href="/login">Go back</a>
            `);
          }
        })
        .catch(err => {
          console.log(err);
          res.send(`
            <h2>An error occurred</h2>
            <a href="/">Go back</a>
          `);
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



app.listen(4000, () => {
  console.log('Server listening on port 4000');
});
