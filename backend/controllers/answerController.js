const Answer = require('../models/Answer');
const Question = require('../models/Question');

const addAnswer = async (req, res) => {
    try {
        const { content } = req.body;
        const question = await Question.findById(req.params.questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = new Answer({
            content,
            user: req.user._id,
            question: question._id
        });

        const createdAnswer = await answer.save();

        question.answers.push(createdAnswer._id);
        await question.save();

        await createdAnswer.populate('user', 'username');

        res.status(201).json(createdAnswer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateAnswer = async (req, res) => {
    try {
        const { content } = req.body;
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (answer.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorised to update this answer' });
        }

        // Update the answer content and set the updatedAt timestamp
        answer.content = content || answer.content;
        answer.updatedAt = new Date();
        
        // Save the updated answer
        let updatedAnswer = await answer.save();
        
        // Populate the user field with the username
        updatedAnswer = await Answer.findById(updatedAnswer._id).populate('user', 'username');

        // Return the complete updated answer
        res.json({
            ...updatedAnswer.toObject(),
            user: {
                _id: updatedAnswer.user._id,
                username: updatedAnswer.user.username
            }
        });
    } catch (error) {
        console.error('Error updating answer:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const deleteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (answer.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Question.updateOne(
            { _id: answer.question },
            { $pull: { answers: answer._id } }
        );

        await answer.deleteOne();
        res.json({ message: 'Answer removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addAnswer,
    updateAnswer,
    deleteAnswer
};
