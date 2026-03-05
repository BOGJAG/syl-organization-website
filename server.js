import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import path from 'path'; // Changed from { dirname, join }
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv'; // Added dotenv import

dotenv.config(); // Call dotenv.config() after import

const __filename = fileURLToPath(import.meta.url); // Added __filename polyfill
const __dirname = path.dirname(__filename); // Updated __dirname polyfill
const app = express();
const PORT = process.env.PORT || 3000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';
const CREDS_FILE = path.join(__dirname, 'credentials.json');

// ─── Google Sheets client ─────────────────────────────────────────────────────

function getSheetsClient() {
    if (!existsSync(CREDS_FILE)) {
        throw new Error('credentials.json not found. See README for setup instructions.');
    }
    const credentials = JSON.parse(readFileSync(CREDS_FILE, 'utf8'));
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

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000', methods: ['POST'] }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.post('/api/leads', async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    if (name.length > 100 || email.length > 200 || phone.length > 30) {
        return res.status(400).json({ success: false, message: 'Input exceeds allowed length.' });
    }
    if (!SPREADSHEET_ID) {
        return res.status(500).json({ success: false, message: 'SPREADSHEET_ID not set in .env' });
    }

    const timestamp = new Date().toISOString();

    try {
        const sheets = getSheetsClient();
        await ensureHeaderRow(sheets);

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:D`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [[timestamp, name, email, phone]],
            },
        });

        console.log(`[Lead] ${name} | ${email} | ${phone}`);
        res.json({ success: true, message: 'Lead recorded successfully!' });

    } catch (err) {
        console.error('[Sheets error]', err.message);
        res.status(500).json({ success: false, message: 'Failed to save lead.' });
    }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`SYL server → http://localhost:${PORT}`);
});
