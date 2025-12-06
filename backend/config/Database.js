const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
mongoose.set('strictQuery', true)
const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('Attempting to connect to MongoDB...');
        const connection = await mongoose.connect(mongoURI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        
        console.log('Successfully connected to MongoDB');
        return connection;
    } catch (error) {
        console.error('Connection to the database failed:', error.message);
         process.exit(1);
    }
};

module.exports = connectDatabase;