const mongoose = require('mongoose');

const ToDoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    details: { type: String, required: true },
    color: { type: String, required: true },
    completed: { type: Boolean, required: true, default: false },
    createdDate: { type: Date, required: true, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('ToDo', ToDoSchema);
