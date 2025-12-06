const supabase = require('../config/supabase');

const addAnswer = async (req, res) => {
    try {
        const { content } = req.body;

        const { data: question, error: questionError } = await supabase
            .from('questions')
            .select('id')
            .eq('id', req.params.questionId)
            .maybeSingle();

        if (questionError || !question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const { data: answer, error } = await supabase
            .from('answers')
            .insert([{
                content,
                user_id: req.user.id,
                question_id: question.id
            }])
            .select(`
                *,
                user:users(username)
            `)
            .single();

        if (error) throw error;

        res.status(201).json(answer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateAnswer = async (req, res) => {
    try {
        const { content } = req.body;

        const { data: answer, error: answerError } = await supabase
            .from('answers')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (answerError || !answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (answer.user_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorised to answer this question' });
        }

        const { data: updatedAnswer, error: updateError } = await supabase
            .from('answers')
            .update({
                content: content || answer.content,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json(updatedAnswer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteAnswer = async (req, res) => {
    try {
        const { data: answer, error: answerError } = await supabase
            .from('answers')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (answerError || !answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (answer.user_id !== req.user.id && !req.user.is_admin) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const { error: deleteError } = await supabase
            .from('answers')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

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
