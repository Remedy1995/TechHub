const supabase = require('../config/supabase');

const getQuestionsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const { data: questions, error } = await supabase
            .from('questions')
            .select(`
                *,
                user:users(username),
                category:categories(name)
            `)
            .eq('category_id', categoryId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createQuestion = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const { data: categoryExists, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('id', category)
            .maybeSingle();

        if (categoryError || !categoryExists) {
            return res.status(404).json({ message: 'Question category does not exist' });
        }

        const { data: question, error } = await supabase
            .from('questions')
            .insert([{
                title,
                content,
                user_id: req.user.id,
                category_id: category
            }])
            .select(`
                *,
                user:users(username),
                category:categories(name)
            `)
            .single();

        if (error) throw error;

        res.status(201).json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const { data: categoryExists, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('id', category)
            .maybeSingle();

        if (categoryError || !categoryExists) {
            return res.status(400).json({ message: 'The question category does not exist' });
        }

        const { data: question, error: questionError } = await supabase
            .from('questions')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (questionError || !question) {
            return res.status(404).json({ message: 'The question does not exist' });
        }

        if (question.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Sorry you dont have permission to edit this question' });
        }

        const { data: updatedQuestion, error: updateError } = await supabase
            .from('questions')
            .update({
                title: title || question.title,
                content: content || question.content,
                category_id: category || question.category_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.params.id)
            .select(`
                *,
                user:users(username),
                category:categories(name)
            `)
            .single();

        if (updateError) throw updateError;

        res.json(updatedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { data: question, error: questionError } = await supabase
            .from('questions')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (questionError || !question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.user_id !== req.user.id && !req.user.is_admin) {
            return res.status(403).json({
                message: 'Not authorized to delete this question'
            });
        }

        const { error: answersError } = await supabase
            .from('answers')
            .delete()
            .eq('question_id', question.id);

        if (answersError) throw answersError;

        const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

        res.json({ message: 'Question removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getQuestionById = async (req, res) => {
    try {
        const { data: question, error: questionError } = await supabase
            .from('questions')
            .select(`
                *,
                user:users(username),
                category:categories(name)
            `)
            .eq('id', req.params.id)
            .maybeSingle();

        if (questionError || !question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const { data: answers, error: answersError } = await supabase
            .from('answers')
            .select(`
                *,
                user:users(username)
            `)
            .eq('question_id', req.params.id)
            .order('created_at', { ascending: false });

        if (answersError) throw answersError;

        question.answers = answers || [];

        res.json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getQuestionsByCategory,
    createQuestion,
    getQuestionById,
    deleteQuestion,
    updateQuestion
};
