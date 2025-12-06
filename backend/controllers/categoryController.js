const supabase = require('../config/supabase');

const getCategories = async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const { data: category, error } = await supabase
            .from('categories')
            .insert([{
                name,
                description,
                created_by: req.user.id
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCategories,
    createCategory
};
