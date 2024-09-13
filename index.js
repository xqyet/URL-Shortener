const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const cors = require('cors');

const app = express();

// Middleware to serve static files from 'public' directory
app.use(express.static('public'));

// Middleware for parsing JSON data
app.use(express.json());
app.use(cors());

// MongoDB connection string
const mongoURI = 'mongodb://localhost/urlshortener';
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('Connection error:', err));

// URL schema
const UrlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
});

const Url = mongoose.model('Url', UrlSchema);

// API endpoint to shorten a URL
app.post('/api/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    const shortUrl = shortid.generate();

    const newUrl = new Url({
        originalUrl,
        shortUrl,
    });

    await newUrl.save();
    res.json({ originalUrl, shortUrl });
});

// API endpoint to redirect shortened URL
app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });

    if (url) {
        res.redirect(url.originalUrl);
    } else {
        res.status(404).json('URL not found');
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
