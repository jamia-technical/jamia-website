import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

import { JnetResult } from '../../types/jnetResult';

// Cache the parsed data so we only read the file once per server lifecycle
let cachedData: JnetResult[] | null = null;

/**
 * Parse M/D/YY (or M/D/YYYY) date string → YYYY-MM-DD
 * Excel stores 2013 as "13", so two-digit years ≤ 30 → 20xx, > 30 → 19xx
 */
function parseExcelDate(raw: string): string {
  // Handle DD-MM-YYYY format (e.g. 12-09-2009)
  if (raw.includes('-')) {
    const parts = raw.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      // Construct explicitly to YYYY-MM-DD
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Handle older M/D/YY or M/D/YYYY format
  const parts = raw.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    if (year < 100) {
      year = year <= 30 ? 2000 + year : 1900 + year;
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return raw;
}

function loadExcelData(): JnetResult[] {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), 'public', 'excel', '+1 JNET Results.xlsx');

  if (!fs.existsSync(filePath)) {
    console.error('JNET results Excel file not found:', filePath);
    return [];
  }

  // Use fs.readFileSync directly, and pass buffer to XLSX.read
  // This avoids Next.js/Webpack mangling the fs.readFileSync call inside the xlsx library
  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // raw: false gives us formatted strings for dates
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

  cachedData = rows
    .filter((r) => r['Application no']) // skip empty rows
    .map((r) => ({
      Rank: Number(r['Rank']) || 0,
      Application_no: String(r['Application no']).trim(),
      name: String(r['name'] || '').trim(),
      stream: String(r['stream'] || '').trim(),
      dob: parseExcelDate(String(r['dob'] || '')),
      Phone_number: String(r['Phone number'] || '').trim(),
      writing_test: {
        Section_A: Number(r['Section A']) || 0,
        Section_B: Number(r['Section B']) || 0,
        Section_C: Number(r['Section C']) || 0,
        Section_D: Number(r['Section D']) || 0,
        Section_E: Number(r['Section E']) || 0,
        Section_F: Number(r['Section F']) || 0,
        total: Number(r['total ']) || 0,   // note: column has trailing space
      },
      interview: {
        islamic_knowledge: Number(r['islamic_knowledge']) || 0,
        science_aptness: Number(r['science_aptness']) || 0,
        communication: Number(r['communication']) || 0,
        general_awareness: Number(r['general_awareness']) || 0,
        achievements: Number(r['achievements']) || 0,
        leadership: Number(r['leadership']) || 0,
        interpersonal: Number(r['interpersonal']) || 0,
        total: Number(r['total']) || 0,
      },
      Grand_total: Number(r['Grand total']) || 0,
      Status: String(r['Status'] || '').trim(),
      campus: String(r['campus'] || '').trim(),
    }));

  return cachedData;
}

export const jnetResultService = {
  /** Find a result by admission number + date of birth */
  findByCredentials(admissionNo: string, dob: string): JnetResult | undefined {
    const data = loadExcelData();
    return data.find(
      (r) =>
        r.Application_no.toLowerCase() === admissionNo.toLowerCase() &&
        r.dob === dob
    );
  },

  /** Find a result by application number */
  findById(applicationNo: string): JnetResult | undefined {
    const data = loadExcelData();
    return data.find(
      (r) => r.Application_no.toLowerCase() === applicationNo.toLowerCase()
    );
  },

  /** Force refresh the cached data (e.g., after uploading a new Excel) */
  invalidateCache() {
    cachedData = null;
  },
};
