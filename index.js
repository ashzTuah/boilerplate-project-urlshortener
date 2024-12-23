require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const dns = require('dns'); // Required for DNS lookup
const app = express();

// Basic Configuration
const port = process.env.PORT || 3001;
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for URL mapping
const urlDatabase = {};
let counter = 1; // Counter for short URLs

// POST endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;//url;//

  // Validate URL format
  if (!validUrl.isWebUri(originalUrl)) {
      return res.json({ error: 'invalid url' });
  }

  // Check if the URL is already shortened
  for (const [shortUrl, url] of Object.entries(urlDatabase)) {
      if (url === originalUrl) {
          return res.json({
              original_url: originalUrl,
              short_url: Number(shortUrl),
          });
      }
  }

  // Assign a new short URL
  const shortUrl = counter++;
  urlDatabase[shortUrl] = originalUrl;

  res.json({
      original_url: originalUrl,
      short_url: shortUrl,
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;

  // Check if the short URL exists
  const originalUrl = urlDatabase[shortUrl];
  if (!originalUrl) {
      return res.status(404).json({ error: 'No short URL found' });
  }

  // Redirect to the original URL
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
