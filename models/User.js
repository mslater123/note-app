// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordSalt: { type: String, required: true },
    passwordHash: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
