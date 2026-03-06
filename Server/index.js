const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// detailed error handler
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Payload too large (Server Limit)' });
    }
    next(err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applications', require('./routes/application'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/sentiment', require('./routes/sentiment'));
app.use('/api/rag', require('./routes/rag'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/acts', require('./routes/acts'));

app.get('/', (req, res) => {
    res.send('AYUSH Gateway API is running');
});

app.get('/health', (req, res) => {
    res.json({
        server: 'online',
        database: 'connected'
    });
});

// Start Server after DB connection
const start = async () => {
    try {
        await connectDB();
        console.log(`Connected to Database: ${mongoose.connection.db.databaseName}`);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

start();



