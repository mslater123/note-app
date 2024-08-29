const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Auth0Strategy = require('passport-auth0');

// Ensure the environment variables are loaded
require('dotenv').config();

// Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        // Use crypto to hash the password and compare it
        crypto.pbkdf2(password, Buffer.from(user.passwordSalt, 'base64'), 310000, 32, 'sha256', (error, hashedPassword) => {
            if (error) {
                return done(error);
            }

            if (!crypto.timingSafeEqual(Buffer.from(user.passwordHash, 'base64'), hashedPassword)) {
                return done(null, false, { message: 'Incorrect username or password.' });
            }

            return done(null, user);
        });
    } catch (error) {
        return done(error);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,       // Must be set in .env
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Must be set in .env
    callbackURL: '/auth/google/callback'           // Define the callback URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value
            });
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Auth0 Strategy
passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/auth/auth0/callback'
}, async (accessToken, refreshToken, extraParams, profile, done) => {
    try {
        let user = await User.findOne({ auth0Id: profile.id });
        if (!user) {
            user = new User({
                auth0Id: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value
            });
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Initiate the Auth0 login flow
router.get('/auth0', passport.authenticate('auth0', {
    scope: 'openid email profile'
}));

// Handle the callback from Auth0
router.get('/auth0/callback', passport.authenticate('auth0', {
    failureRedirect: '/login'
}), (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect('/dashboard');
});

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
                    username,
                    email,
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

// Profile update route
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const user = req.user;
        updates.forEach(update => {
            if (update === 'password') {
                // If updating the password, hash it before saving
                const salt = crypto.randomBytes(16);
                crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', (error, hashedPassword) => {
                    if (error) {
                        throw new Error('Error while updating password');
                    }
                    user.passwordSalt = salt.toString('base64');
                    user.passwordHash = hashedPassword.toString('base64');
                });
            } else {
                user[update] = req.body[update];
            }
        });
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
