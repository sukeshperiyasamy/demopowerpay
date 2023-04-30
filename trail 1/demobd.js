const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Set up MongoDB connection
mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schema for user data
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// Create a model for the user data
const User = mongoose.model('User', userSchema);

// Use body-parser to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the login page when the user visits the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if user exists in the database
  User.findOne({ email: email }, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    // Check if password is correct
    if (password === user.password) {
      // TODO: Generate JWT and set it as a cookie
      res.send('Login successful');
    } else {
      res.status(401).send('Invalid email or password');
    }
  });
});

// Serve the signup page when the user visits the /signup URL
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle signup form submission
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  // Create a new user in the database
  const user = new User({ email, password });
  user.save(err => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    // TODO: Generate JWT and set it as a cookie
    res.send('Signup successful');
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
