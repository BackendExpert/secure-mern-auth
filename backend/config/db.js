const mongoose = require('mongoose');

module.exports = function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not set');
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected'))
        .catch(err => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
};
