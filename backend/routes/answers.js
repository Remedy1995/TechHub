const express = require('express');
const router = express.Router();
const { 
    addAnswer, 
    updateAnswer, 
    deleteAnswer 
} = require('../controllers/answerController');
const { auth } = require('../middleware/auth');

router.route('/:questionId/answers')
    .post(auth, addAnswer);

router.route('/:id')
    .put(auth, updateAnswer)
    .delete(auth, deleteAnswer);

module.exports = router;