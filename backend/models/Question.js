const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    views: {
        type: Number,
        default: 0
    },
    votes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add text index for search functionality
questionSchema.index({ title: 'text', content: 'text' });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;