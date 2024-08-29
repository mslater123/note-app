const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User'); // Ensure correct path
const getToDoModel = require('./models/ToDo');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Specify the directory where your views are stored (optional, if different from default)
app.use(express.static('public'));
app.set('views', './views');

// Middleware
app.use(cors());
app.use(express.json());

// Set up sessions and passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Import Routers
const authRouter = require('./routers/authRouter');
const todoRouter = require('./routers/todoRouter');  // Import the todoRouter

// Use Routers
app.use('/auth', authRouter);
app.use('/todos', todoRouter);  // Use the todoRouter for handling /todos routes

// Middleware to check if the user is authenticated
function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

// Define routes
app.get('/', (req, res) => {
    const data = {
        title: 'Your Todo List',
        message: 'Hello, this is a dynamic message!'
    };
    res.render('index', data);  // Pass the data object to the template
});

app.get('/debug-session', (req, res) => {
    res.json(req.session);
});

app.get('/login', (req, res) => {
    res.render('login'); // 'login' refers to 'login.ejs' or equivalent
});

// Optionally, you can handle registration as a different route
app.get('/register', (req, res) => {
    res.redirect('/login?register=true'); // Redirects to the login page with the register form active
});

// Protected route
const auth = require('./middleware/auth');

app.get('/noteview', requireAuth, (req, res) => {
    res.render('noteview');
});

// Example middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from the authenticated user

        // Query the todos for the specific user
        const todos = await getToDoModel.find({ userId });

        // Render the dashboard page, passing the todos and username
        res.render('dashboard', { username: req.user.username, todos });
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).send('Internal server error');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.post('/', async (req, res) => {
    const { title, details, color } = req.body;
    try {
        const todo = new req.ToDo({ title, details, color, userId: req.user._id }); // Add userId here
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || user.passwordHash !== password) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        req.session.save(err => {
            if (err) {
                return res.render('login', { error: 'Session save failed. Please try again.' });
            }
            res.redirect('/dashboard');
        });
    } catch (error) {
        res.render('login', { error: 'Something went wrong. Please try again.' });
    }
});

// MongoDB connection
const start = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
        
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Error handling for uncaught errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

start();
