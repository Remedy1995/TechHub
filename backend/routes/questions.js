const express = require('express');
const router = express.Router();
const { 
    getQuestionsByCategory, 
    createQuestion,
    getQuestionById,
    deleteQuestion,
} = require('../controllers/questionController');
const { auth } = require('../middleware/auth');
const { updateAnswer } = require('../controllers/answerController');

router.route('/category/:categoryId').get(getQuestionsByCategory);
router.route('/:id').get(getQuestionById);
router.route('/').post(auth , createQuestion);
router.route('/:id').put(auth, updateAnswer).delete(deleteQuestion)

module.exports = router;