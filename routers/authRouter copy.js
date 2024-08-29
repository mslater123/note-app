const express = require('express');
const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const crypto = require('crypto');
const router = express.Router();
const auth = require('../middleware/auth');

const LocalStrategy = require('passport-local')
const Auth0Strategy = require('passport-auth0')
const GoogleStrategy = require('passport-google-oauth')

passport.use(new LocalStrategy(async function verify(username, password, callback) {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return callback(null, false, { message: 'Incorrect username or password.' });
        }

        crypto.pbkdf2(password, Buffer.from(user.passwordSalt, 'base64'), 310000, 32, 'sha256', (error, hashedPassword) => {
            if (error) {
                return callback(error);
            }

            if (!crypto.timingSafeEqual(Buffer.from(user.passwordHash, 'base64'), hashedPassword)) {
                return callback(null, false, { message: 'Incorrect username or password.' });
            }

            return callback(null, user);
        });
    } catch (error) {
        return callback(error);
    }
}));

passport.serializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, { id: user._id, username: user.username });
    });
});

passport.deserializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, user);
    });
});


// Passport Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Auth0Strategy Strategy
passport.use(new GoogleStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Google Strategy
passport.use(new GoogleStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Login route
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find the user in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Hash the provided password using the stored salt
        crypto.pbkdf2(password, Buffer.from(user.passwordSalt, 'base64'), 310000, 32, 'sha256', (error, hashedPassword) => {
            if (error) {
                return next('Error while verifying password');
            }

            // Compare the hashed password
            if (hashedPassword.toString('base64') !== user.passwordHash) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            // Authentication successful
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Login failed. Please try again.' });
                }
                return res.redirect('/dashboard');
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Error logging in. Please try again.' });
    }
});


// Registration route
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Generate a salt
        const salt = crypto.randomBytes(16);

        // Hash the password with the salt
        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async (error, hashedPassword) => {
            if (error) {
                return next('Error while creating password hash');
            }

            try {
                // Create a new user with the hashed password and salt
                const newUser = new User({
                    username: username,
                    email: email,
                    passwordSalt: salt.toString('base64'),
                    passwordHash: hashedPassword.toString('base64')
                });

                // Save the new user to the database
                await newUser.save();

                // Automatically log the user in after registration
                req.logIn(newUser, (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Login after registration failed' });
                    }
                    return res.redirect('/dashboard');
                });
            } catch (error) {
                console.error('Registration error:', error);
                return res.status(500).json({ error: 'Error creating user' });
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Error creating user' });
    }
});

router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const user = req.user;
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});


module.exports = router;
