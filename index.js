const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from the public folder

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener'; // Updated MongoDB URI environment variable

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('Connection error:', err));

// URL Schema
const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
    createdAt: { type: Date, default: Date.now }
});

const Url = mongoose.model('Url', urlSchema);

// API to shorten URL
app.post('/api/shorten', async (req, res) => {
    const { originalUrl } = req.body;

    const shortUrl = shortid.generate();

    const newUrl = new Url({ originalUrl, shortUrl });
    await newUrl.save();

    res.json({
        originalUrl,
        shortUrl: `${req.headers.host}/${shortUrl}`
    });
});

// Redirect short URL to original URL
app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;

    const url = await Url.findOne({ shortUrl });
    if (url) {
        res.redirect(url.originalUrl);
    } else {
        res.status(404).json('URL not found');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
