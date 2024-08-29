const express = require('express');
const ToDo = require('../models/ToDo'); // Use the correct path to your model
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to set the correct ToDo model for the authenticated user
router.use(auth, (req, res, next) => {
    try {
        // You don't need dynamic models, use the static model
        console.log(`Authenticated user: ${req.user.id}`);
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all todos for the authenticated user
router.get('/', async (req, res) => {
    try {
        const todos = await ToDo.find({ userId: req.user.id });
        res.status(200).json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new todo for the authenticated user
router.post('/', async (req, res) => {
    const { title, details, color } = req.body;

    if (!title || !details || !color) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const todo = new ToDo({ title, details, color, userId: req.user.id });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// View a specific todo by ID
router.get('/view/:id', async (req, res) => {
    const todoId = req.params.id;  // Get the ToDo ID from the URL parameters

    try {
        const todo = await ToDo.findById(todoId);  // Fetch the ToDo by ID
        if (!todo) {
            return res.status(404).send('To-do not found');
        }
        res.render('view', { todo });  // Pass the fetched ToDo to the view template
    } catch (error) {
        console.error('Error fetching todo:', error);
        res.status(500).send('Internal server error');
    }
});

// Update a todo by ID
router.put('/todo/:id', async (req, res) => {
    const { title, details, color } = req.body;
    const todoId = req.params.id;

    try {
        const todo = await ToDo.findOneAndUpdate(
            { _id: todoId, userId: req.user.id },
            { title, details, color },
            { new: true }
        );
        if (!todo) {
            return res.status(404).json({ message: 'To-do not found' });
        }
        res.status(200).json(todo);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a todo by ID
router.delete('/:id', async (req, res) => {
    const todoId = req.params.id;

    try {
        const todo = await ToDo.findOneAndDelete({ _id: todoId, userId: req.user.id });
        if (!todo) {
            return res.status(404).json({ message: 'To-do not found' });
        }
        res.status(200).json({ message: 'To-do deleted' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Reorder todos
router.post('/reorder', async (req, res) => {
    const { order } = req.body;

    try {
        // Example logic to handle reordering of todos (adjust according to your database schema)
        for (let i = 0; i < order.length; i++) {
            await req.ToDo.updateOne({ _id: order[i] }, { $set: { order: i } });
        }

        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order' });
    }
});

module.exports = router;
