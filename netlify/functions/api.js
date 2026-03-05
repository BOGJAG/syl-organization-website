import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const router = express.Router();
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

function getSheetsClient() {
    let credentials;
    // Check if credentials are provided via Netlify Environment Variables
    if (process.env.GOOGLE_CREDENTIALS) {
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } else {
        // Fallback for local development using the local JSON file
        const CREDS_FILE = path.join(__dirname, '../../credentials.json');
        if (!existsSync(CREDS_FILE)) {
            throw new Error('credentials.json not found and GOOGLE_CREDENTIALS env var not set.');
        }
        credentials = JSON.parse(readFileSync(CREDS_FILE, 'utf8'));
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
}

async function ensureHeaderRow(sheets) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:D1`,
    });
    if (!res.data.values || res.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:D1`,
            valueInputOption: 'RAW',
            requestBody: { values: [['Timestamp', 'Name', 'Email', 'Phone']] },
        });
    }
}

app.use(cors());
app.use(express.json());

// Handle the POST request to /leads
router.post('/leads', async (req, res) => {
    const { name, email, phone, timestamp } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    if (!SPREADSHEET_ID) {
        return res.status(500).json({ success: false, message: 'SPREADSHEET_ID not set in environment' });
    }

    try {
        const sheets = getSheetsClient();
        await ensureHeaderRow(sheets);

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:D`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [[timestamp || new Date().toISOString(), name, email, phone]],
            },
        });

        console.log(`[Lead] ${name} | ${email} | ${phone}`);
        res.json({ success: true, message: 'Lead recorded successfully!' });

    } catch (err) {
        console.error('[Sheets error]', err.message);
        res.status(500).json({ success: false, message: 'Failed to save lead.' });
    }
});

// Netlify rewrite rules means the path could be /api/leads or /.netlify/functions/api/leads
app.use('/api', router);
app.use('/.netlify/functions/api', router);

// Export the serverless handler
export const handler = serverless(app);
