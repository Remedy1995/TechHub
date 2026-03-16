const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Generate auth token
// In User.js - Update the generateAuthToken method
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({
        _id: this._id.toString(),
        isAdmin: this.isAdmin
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Replace all tokens with the new one
    this.tokens = [{ token }];
    await this.save();
    return token;
};
// Find user by credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
        throw new Error('No user found with this email');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Incorrect password');
    }
    return user;
};

// Hide sensitive data
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;
    return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;