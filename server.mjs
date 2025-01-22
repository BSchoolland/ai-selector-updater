import express from 'express';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAiResponse } from './minimal-ai-system/ai-response.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/fetch-html', async (req, res) => {
    try {
        const { url, dataWanted } = req.body;
        console.log('Fetching HTML from: ', url);
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url);
        const html = await page.content();
        await browser.close();
        
        const aiResponse = await getAiResponse([{
            role: 'user',
            content: `HTML: ${html}
DATA WANTED: ${dataWanted}`
        }], html);
        res.json({ 
            aiResponse 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 