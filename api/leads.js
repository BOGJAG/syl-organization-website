import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

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
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const { name, email, phone, timestamp } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    if (!SPREADSHEET_ID) {
        return res.status(500).json({ success: false, message: 'SPREADSHEET_ID not configured.' });
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
        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('[Sheets error]', err.message);
        return res.status(500).json({ success: false, message: 'Failed to save lead.' });
    }
}
