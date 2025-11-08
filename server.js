const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Your secret Gemini API key.
// For a real deployment on a service like Render, you would set this
// as an environment variable instead of hardcoding it.
const GEMINI_API_KEY = "AIzaSyDR4kInKTHbOZsQvMkqZboB41RafnS-vpE";

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint that the frontend will call
app.post('/ask-gemini', async (req, res) => {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemPrompt = "You are a helpful and friendly AI assistant named Gemini, specialized in answering questions and providing concise, easy-to-understand explanations. Always keep your responses brief (1-3 sentences) and conversational. Do not use Markdown formatting like bolding or lists unless absolutely necessary. For any information you gather, you MUST include citations.";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Forward the response from Gemini back to our frontend
        res.json(response.data);

    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

// Fallback to serve the main HTML file for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Chatroompro.html'));
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
