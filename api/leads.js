import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://sylorgmd.vercel.app';

// Input length limits
const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_PHONE = 30;

function getSheetsClient() {
    let credentials;

    // Vercel: credentials stored as JSON string in env var
    if (process.env.GOOGLE_CREDENTIALS) {
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } else {
        // Local dev: read from file
        const credsFile = join(process.cwd(), 'credentials.json');
        if (!existsSync(credsFile)) {
            throw new Error('No credentials found. Set GOOGLE_CREDENTIALS env var or add credentials.json.');
        }
        credentials = JSON.parse(readFileSync(credsFile, 'utf8'));
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

export default async function handler(req, res) {
    // CORS — only allow requests from our own domain
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const { name, email, phone } = req.body;

    // Validate presence and length — never trust client-supplied timestamp
    if (!name || !email || !phone) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    if (name.length > MAX_NAME || email.length > MAX_EMAIL || phone.length > MAX_PHONE) {
        return res.status(400).json({ success: false, message: 'Input exceeds allowed length.' });
    }
    if (!SPREADSHEET_ID) {
        return res.status(500).json({ success: false, message: 'SPREADSHEET_ID not configured.' });
    }

    // Always generate timestamp server-side
    const timestamp = new Date().toISOString();

    try {
        const sheets = getSheetsClient();
        await ensureHeaderRow(sheets);

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:D`,
            // RAW prevents formula injection (e.g. =HYPERLINK(...) in name field)
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [[timestamp, name, email, phone]],
            },
        });

        console.log(`[Lead] ${name} | ${email} | ${phone}`);
        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('[Sheets error]', err.message);
        return res.status(500).json({ success: false, message: 'Failed to save lead.' });
    }
}
