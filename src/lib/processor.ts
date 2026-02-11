import * as XLSX from 'xlsx';
import JSZip from 'jszip';

// --- Types ---
export interface Config {
    projectCode: string;
    vendorCpis?: Record<string, number>;
    headers: {
        src: string;
        response_id: string;
        db_mobile: string;
        complete_incentive: string;
        pprid: string;
        ref: string;
        referral_incentive: string;
        status: string;
    };
}

export interface ProcessedResult {
    zipBlob: Blob;
    report: string[];
    previewStats: {
        totalComplete: number;
        totalEvoucherSum: number; // For Panel IFM / Zalo
        totalReferralSum: number; // For Referrers
        countsBySrc: Record<string, number>;
        vendorCosts: Record<string, number>;
    };
}

// --- Helpers (Migrated from GAS) ---
function trim(s: any): string {
    return (s == null ? '' : String(s)).trim();
}

function norm(s: any): string {
    return (s == null ? '' : String(s)).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizeSrcKey(raw: any): string {
    const s = (raw || '').toString().trim().toLowerCase();
    if (s === '') return '';
    if (s === 'referral' || s === 'referal') return 'referral';
    if (s === 'zalo' || s === 'zalo group' || s === 'zalo-group' || s === 'zalo_group') return 'zalogroup';
    if (s === 'pp pure spectrum' || s === 'pp-purespectrum' || s === 'pp_pure_spectrum') return 'pp_purespectrum';
    return s;
}

function normalizePhone(s: any): string {
    s = trim(s);
    if (!s) return '';
    return s.replace(/\D+/g, '');
}

function parseMoneyVND(s: any): number {
    s = trim(s);
    if (!s) return 0;
    const cleaned = s.replace(/[^\d-]/g, '');
    if (!cleaned || cleaned === '-') return 0;
    const n = parseInt(cleaned, 10);
    return isNaN(n) ? 0 : n;
}

function normalizeStatus(s: any): string {
    return String(s || '').trim().toLowerCase();
}

function rowIsComplete(row: any, statusColIdx: number | null): boolean {
    if (statusColIdx === null) return true;
    // If status column exists but value is empty/undefined, assume not complete? 
    // GAS logic: if (statusIdx==null || isNaN(statusIdx)) return true;
    // Here we pass index. If index is valid, check value.
    const v = normalizeStatus(row[statusColIdx]);
    return (v === 'complete' || v === 'completed');
}

function addPrefixToName(projectCode: string, base: string): string {
    projectCode = (projectCode || '').trim();
    return projectCode ? (projectCode + '-' + base) : base;
}

// --- Main Processor ---
export async function processExcelFile(file: File, config: Config): Promise<ProcessedResult> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Pick first sheet or "Completed" if exists
    let sheetName = workbook.SheetNames.find(n => n === 'Completed') || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (!data || data.length === 0) {
        throw new Error("File is empty");
    }

    // 1. Find Header Row
    const headerTargets = Object.values(config.headers).map(h => norm(h));
    let headerRowIdx = -1;
    let colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(20, data.length); r++) {
        const row = data[r].map(c => norm(c));
        let hit = 0;
        const tempMap: Record<string, number> = {};

        // Check for key headers
        const keys = Object.keys(config.headers) as Array<keyof typeof config.headers>;
        for (const key of keys) {
            const target = norm(config.headers[key]);
            if (!target) continue;
            const idx = row.indexOf(target); // Simple exact match on normalized string
            // Or fuzzy match like GAS: cell.indexOf(t)>=0 || t.indexOf(cell)>=0
            // Let's stick to simple match first, or improve if needed. 
            // GAS used: if (cell===t || cell.indexOf(t)>=0 || t.indexOf(cell)>=0)
            const foundIdx = row.findIndex(cell => cell && (cell === target || cell.includes(target) || target.includes(cell)));

            if (foundIdx >= 0) {
                tempMap[key] = foundIdx;
                hit++;
            }
        }

        if (hit >= 2) { // Threshold found in GAS
            headerRowIdx = r;
            colMap = tempMap;
            break;
        }
    }

    if (headerRowIdx === -1) {
        throw new Error("Could not find header row. Please check column names.");
    }

    // 2. Extract Data
    const rows = data.slice(headerRowIdx + 1);
    const groups: Record<string, any[][]> = {};
    const fulcrumDisqualifiedRows: any[][] = [];

    const col = {
        src: colMap['src'],
        db_mobile: colMap['db_mobile'],
        complete_incentive: colMap['complete_incentive'],
        pprid: colMap['pprid'],
        ref: colMap['ref'],
        referral_incentive: colMap['referral_incentive'],
        response_id: colMap['response_id'],
        status: colMap['status'] ?? -1 // -1 if not found
    };

    // Stats
    // Stats
    let totalCompleteCount = 0;
    let totalPanelIncentiveSum = 0;
    let totalReferralSum = 0;
    const countsBySrc: Record<string, number> = {};

    for (const row of rows) {
        // Skip empty rows
        if (row.every(c => !trim(c))) continue;

        const currentSrc = normalizeSrcKey(row[col.src]);

        // Fulcrum Disqualified Check
        if (currentSrc === 'pp_fulcrum' && col.status !== -1) {
            const currentStatus = normalizeStatus(row[col.status]);
            if (currentStatus === 'disqualified') {
                fulcrumDisqualifiedRows.push([
                    row[col.pprid] || '',
                    row[col.response_id] || '',
                    row[col.status] || ''
                ]);
                continue;
            }
        }

        // Check Complete
        if (!rowIsComplete(row, col.status !== -1 ? col.status : null)) continue;

        // Stats
        totalCompleteCount++;
        countsBySrc[currentSrc] = (countsBySrc[currentSrc] || 0) + 1;

        if (currentSrc === '' || currentSrc === 'zalogroup') {
            totalPanelIncentiveSum += parseMoneyVND(row[col.complete_incentive]);
        } else if (currentSrc === 'referral') {
            totalReferralSum += parseMoneyVND(row[col.referral_incentive]);
        }

        // Grouping
        if (!groups[currentSrc]) groups[currentSrc] = [];
        groups[currentSrc].push(row);
    }

    // 3. Generate Files
    const zip = new JSZip();
    const report: string[] = [];
    const projectCode = config.projectCode;

    // Helper to add xlsx to zip
    const addXlsx = (name: string, headers: string[], dataRows: any[][]) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        zip.file(name + '.xlsx', wbout);
        report.push(`Generated: ${name}.xlsx (${dataRows.length} rows)`);
    };

    // A) complete-topup-evoucher_gotit
    let allRefRows: any[] = [];
    ['', 'zalogroup', 'referral'].forEach(k => {
        if (groups[k]) allRefRows = allRefRows.concat(groups[k]);
    });

    if (allRefRows.length > 0) {
        const dataA: any[][] = [];
        let count = 0;
        let totalEv = 0;

        for (const r of allRefRows) {
            // Skip if looks like header (GAS logic) - simplified here as we stripped header
            const mobile = trim(r[col.db_mobile]);
            const inc = trim(r[col.complete_incentive]);
            if (!mobile && !inc) continue;

            dataA.push([mobile, inc]);
            totalEv += parseMoneyVND(inc);
            count++;
        }

        const baseName = `complete-topup-evoucher_gotit-${count}-${totalEv}`;
        addXlsx(addPrefixToName(projectCode, baseName), ['db.mobile', 'complete incentive'], dataA);
    }

    // B) referrer
    if (groups['referral'] && groups['referral'].length > 0) {
        const agg: Record<string, number> = {};
        const display: Record<string, string> = {};

        for (const r of groups['referral']) {
            const phoneRaw = trim(r[col.ref]);
            const incRaw = trim(r[col.referral_incentive]);
            if (!phoneRaw && !incRaw) continue;

            const phoneKey = normalizePhone(phoneRaw);
            if (!phoneKey) continue;

            const money = parseMoneyVND(incRaw);
            if (agg[phoneKey] == null) {
                agg[phoneKey] = 0;
                display[phoneKey] = phoneKey; // Or original phoneRaw? GAS uses phoneKey logic mostly
            }
            agg[phoneKey] += money;
        }

        const phones = Object.keys(agg).sort();
        const dataB: any[][] = [];
        let grandTotal = 0;

        for (const p of phones) {
            dataB.push([display[p], agg[p]]);
            grandTotal += agg[p];
        }

        const baseNameB = `referrer-${phones.length}-${grandTotal}`;
        addXlsx(addPrefixToName(projectCode, baseNameB), ['ref - referrer', 'referral incentive'], dataB);
    }

    // C) Export ALL src values (not just predefined ones)
    // Get all unique src keys except the evoucher-related ones (blank, zalogroup, referral)
    const evoucherSrcs = ['', 'zalogroup', 'referral'];
    const allSrcKeys = Object.keys(groups).filter(k => !evoucherSrcs.includes(k));

    allSrcKeys.forEach(ksrc => {
        if (groups[ksrc] && groups[ksrc].length > 0) {
            const dataC: any[][] = [];
            for (const r of groups[ksrc]) {
                const val = trim(r[col.pprid]);
                if (val) dataC.push([val]);
            }
            if (dataC.length > 0) {
                let baseNameC = `${ksrc}-${dataC.length}`;

                // Add CPI to filename if it's a pp_ vendor and CPI is provided
                if (ksrc.startsWith('pp_') && config.vendorCpis?.[ksrc]) {
                    const cpi = config.vendorCpis[ksrc];
                    baseNameC += `-cpi${cpi}`;
                }

                addXlsx(addPrefixToName(projectCode, baseNameC), ["pprid - panel provider's respondent id"], dataC);
            }
        }
    });

    // D) pp_fulcrum (txt)
    if (groups['pp_fulcrum'] && groups['pp_fulcrum'].length > 0) {
        const cntF = groups['pp_fulcrum'].length;
        let baseNameF = `fulcrum_${cntF}`;

        // Add CPI to filename if CPI is provided
        if (config.vendorCpis?.['pp_fulcrum']) {
            const cpi = config.vendorCpis['pp_fulcrum'];
            baseNameF += `-cpi${cpi}`;
        }

        const nameF = addPrefixToName(projectCode, baseNameF) + '.txt';
        zip.file(nameF, String(cntF));
        report.push(`Generated: ${nameF}`);
    }

    // E) Fulcrum Disqualified
    if (fulcrumDisqualifiedRows.length > 0) {
        // Create a separate sheet or CSV? GAS creates a sheet in the spreadsheet.
        // Here we can export as CSV or XLSX. Let's do XLSX for consistency or CSV as requested in one part.
        // GAS logic: "Tự tạo sheet...".
        // Let's make it an XLSX file in the zip.
        const dqHeaders = ["pprid - panel provider's respondent id", "Response ID", "Status", "Reason QC (Formula Placeholder)"];
        // Note: Formulas like VLOOKUP won't work in a standalone XLSX unless the other sheet is there.
        // We will just export the data.
        addXlsx('Fulcrum_Disqualified', dqHeaders, fulcrumDisqualifiedRows);
    }

    // F) CSV Merged (Evoucher)
    // Re-iterate to build merged list
    const mergedData: any[][] = [];
    let mergedTotalSum = 0;
    let mergedCount = 0;

    // From A (Complete Topup)
    if (allRefRows.length > 0) {
        for (const r of allRefRows) {
            const mobile = normalizePhone(r[col.db_mobile]);
            if (!mobile) continue;
            const inc = parseMoneyVND(r[col.complete_incentive]);
            mergedData.push([mobile, inc, 'Evoucher GOTIT', 'Đạt chất lượng']);
            mergedTotalSum += inc;
            mergedCount++;
        }
    }

    // From B (Referrer) - aggregated
    if (groups['referral'] && groups['referral'].length > 0) {
        // Re-calculate aggregation for CSV (same logic as B)
        const agg: Record<string, number> = {};
        for (const r of groups['referral']) {
            const phone = normalizePhone(r[col.ref]);
            const inc = parseMoneyVND(r[col.referral_incentive]);
            if (!phone) continue;
            if (agg[phone] == null) agg[phone] = 0;
            agg[phone] += inc;
        }
        const phones = Object.keys(agg).sort();
        for (const p of phones) {
            mergedData.push([p, agg[p], 'Evoucher GOTIT', 'Giới thiệu thành công']);
            mergedTotalSum += agg[p];
            mergedCount++;
        }
    }

    if (mergedData.length > 0) {
        const baseNameMerged = `evoucher_gotit-merged-${mergedCount}-${mergedTotalSum}`;
        const filenameMerged = addPrefixToName(projectCode, baseNameMerged) + '.csv';

        // Create CSV content with BOM
        const csvHeader = ['mobile', 'incentive', 'incentive_type', 'response_status'];
        const csvContent = [csvHeader, ...mergedData].map(row =>
            row.map((c: any) => {
                const s = String(c ?? '');
                return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            }).join(',')
        ).join('\n');

        zip.file(filenameMerged, '\uFEFF' + csvContent);
        report.push(`Generated: ${filenameMerged}`);
    }

    // Calculate vendor costs for pp_ vendors
    const vendorCosts: Record<string, number> = {};
    if (config.vendorCpis) {
        Object.entries(config.vendorCpis).forEach(([vendor, cpi]) => {
            const count = countsBySrc[vendor] || 0;
            if (count > 0 && cpi > 0) {
                vendorCosts[vendor] = count * cpi;
            }
        });
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    return {
        zipBlob,
        report,
        previewStats: {
            totalComplete: totalCompleteCount,
            totalEvoucherSum: totalPanelIncentiveSum,
            totalReferralSum: totalReferralSum,
            countsBySrc,
            vendorCosts
        }
    };
}
