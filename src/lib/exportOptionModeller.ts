import ExcelJS from "exceljs";

// ── Brand colours ─────────────────────────────────────────────────────────────

const NAVY_HEX      = "173660";
const BLUE_HEX      = "1A7EC8";
const OFFWHITE      = "F4F7FA";
const SLATE         = "CDD8E3";
const MUTED         = "5C6B7A";
const WHITE         = "FFFFFF";
const YELLOW_BG     = "FFFACD";
const YELLOW_BORDER = "E8C43A";
const GREEN_BG      = "D6F0E0";
const GREEN_TEXT    = "1A6B3C";
const RED_BG        = "FBEAE8";
const RED_TEXT      = "A33222";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GrantExport {
  id: string;
  label: string;
  totalOptions: number;
  strikePrice: number;
  fullyDiluted: number;
  grantDate: string;
  vestYears: number;
  cliffMonths: number;
  vestedCount: number;
  vestedPct: number;
  cliffDate: string;
  fullyVestedDate: string;
}

export interface PerGrantScenario {
  grantId: string;
  label: string;
  strike: number;
  gainPerOption: number;
  vestedValue: number;
  fullGrantValue: number;
  totalGrant: number;
  vestedCount: number;
}

export interface ScenarioResultMulti {
  id: string;
  label: string;
  editable: boolean;
  valuation: number;
  impliedSharePrice: number;
  perGrant: PerGrantScenario[];
  totalVestedValue: number;
  totalFullGrantValue: number;
  weightedGainPerOption: number;
  multiple: number;
}

export interface ExportOptions {
  grants: GrantExport[];
  globalDiluted: number;
  todayDate: string;
  weightedAvgStrike: number;
  scenarios: ScenarioResultMulti[];
}

// ── Format helpers ────────────────────────────────────────────────────────────

function fmtValuation(n: number): string {
  if (!n || n <= 0) return "$0";
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${(v < 100 && v % 1 !== 0) ? v.toFixed(1) : v.toFixed(0)}M`;
  }
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtLargeCAD(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0.00";
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${(v < 100 && v % 1 !== 0) ? v.toFixed(1) : v.toFixed(0)}M`;
  }
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(n);
}

function fmtCAD(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0.00";
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(n);
}

function fmtMultiple(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  return `${n.toFixed(2)}x`;
}

// ── Fill / style helpers ──────────────────────────────────────────────────────

const navyFill     = (): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb: "FF" + NAVY_HEX } });
const offwhiteFill = (): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb: "FF" + OFFWHITE } });
const whiteFill    = (): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb: "FF" + WHITE } });
const hexFill      = (h: string): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb: "FF" + h } });

function slateBorder(): Partial<ExcelJS.Borders> {
  const s: ExcelJS.Border = { style: "thin", color: { argb: "FF" + SLATE } };
  return { top: s, left: s, bottom: s, right: s };
}

function applyNavyHeader(row: ExcelJS.Row, colCount: number) {
  row.height = 24;
  row.eachCell((cell, col) => {
    if (col > colCount) return;
    cell.fill = navyFill();
    cell.font = { name: "Arial", bold: true, size: 9, color: { argb: "FF" + WHITE } };
    cell.alignment = { horizontal: col === 1 ? "left" : "right", vertical: "middle" };
    cell.border = slateBorder();
  });
}

// ── Sheet: Individual Grant ───────────────────────────────────────────────────

function buildGrantSheet(ws: ExcelJS.Worksheet, grant: GrantExport, index: number) {
  ws.columns = [{ key: "label", width: 36 }, { key: "value", width: 26 }];

  // Title
  ws.mergeCells("A1:B1");
  const title = ws.getCell("A1");
  title.value = (grant.label || `Grant ${index}`).toUpperCase();
  title.fill = navyFill();
  title.font = { name: "Arial", bold: true, size: 11, color: { argb: "FF" + WHITE } };
  title.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 28;

  let row = 2;

  // Inputs header
  ws.mergeCells(`A${row}:B${row}`);
  const inp = ws.getRow(row++);
  inp.getCell(1).value = "INPUTS";
  inp.getCell(1).font = { name: "Arial", bold: true, size: 8, color: { argb: "FF" + MUTED } };
  inp.getCell(1).fill = offwhiteFill();

  const inputRows: [string, string | number][] = [
    ["Grant Name",                         grant.label || `Grant ${index}`],
    ["Options Granted",                    grant.totalOptions],
    ["Strike Price per Share (CAD)",       `$${grant.strikePrice.toFixed(4)}`],
    ["Fully Diluted Shares at Grant",      grant.fullyDiluted],
    ["Ownership % at Grant",               grant.fullyDiluted > 0 ? `${((grant.totalOptions / grant.fullyDiluted) * 100).toFixed(4)}%` : "—"],
    ["Grant Date",                         grant.grantDate || "—"],
    ["Vesting Schedule",                   `${grant.vestYears}-year / ${grant.cliffMonths > 0 ? `${grant.cliffMonths}-month cliff` : "no cliff"}`],
  ];

  for (const [label, value] of inputRows) {
    const r = ws.getRow(row);
    r.height = 20;
    const lc = r.getCell(1);
    lc.value = label;
    lc.font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY_HEX } };
    lc.fill = whiteFill(); lc.alignment = { horizontal: "left", vertical: "middle" };
    lc.border = slateBorder();
    const vc = r.getCell(2);
    vc.value = value;
    vc.font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY_HEX } };
    vc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + YELLOW_BG } };
    vc.border = { ...slateBorder(), left: { style: "thin", color: { argb: "FF" + YELLOW_BORDER } } };
    vc.alignment = { horizontal: "right", vertical: "middle" };
    if (typeof value === "number") vc.numFmt = "#,##0";
    row++;
  }

  ws.getRow(row++).height = 6;

  // Vesting outputs
  ws.mergeCells(`A${row}:B${row}`);
  const vest = ws.getRow(row++);
  vest.getCell(1).value = "VESTING STATUS";
  vest.getCell(1).font = { name: "Arial", bold: true, size: 8, color: { argb: "FF" + MUTED } };
  vest.getCell(1).fill = offwhiteFill();

  const vestRows: [string, string | number][] = [
    ["Vested Options Today",  grant.vestedCount],
    ["Vested %",              `${grant.vestedPct.toFixed(2)}%`],
    ["Cliff Date",            grant.cliffDate || "—"],
    ["Fully Vested Date",     grant.fullyVestedDate || "—"],
  ];

  for (const [label, value] of vestRows) {
    const r = ws.getRow(row);
    r.height = 20;
    const lc = r.getCell(1);
    lc.value = label;
    lc.font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY_HEX } };
    lc.fill = whiteFill(); lc.alignment = { horizontal: "left", vertical: "middle" };
    lc.border = slateBorder();
    const vc = r.getCell(2);
    vc.value = value;
    vc.font = { name: "Arial", bold: true, size: 9, color: { argb: "FF" + BLUE_HEX } };
    vc.fill = whiteFill(); vc.border = slateBorder();
    vc.alignment = { horizontal: "right", vertical: "middle" };
    if (typeof value === "number") vc.numFmt = "#,##0";
    row++;
  }

  row++;
  ws.mergeCells(`A${row}:B${row}`);
  const nc = ws.getRow(row).getCell(1);
  nc.value = "For informational purposes only. Not financial or legal advice.  |  Rhino Ventures · rhinovc.com";
  nc.font = { name: "Arial", italic: true, size: 8, color: { argb: "FF" + MUTED } };
  nc.alignment = { horizontal: "left" };
}

// ── Sheet: Summary ────────────────────────────────────────────────────────────

function buildSummarySheet(ws: ExcelJS.Worksheet, grants: GrantExport[], globalDiluted: number, weightedAvgStrike: number) {
  ws.columns = [
    { key: "label",       width: 28 },
    { key: "options",     width: 16 },
    { key: "strike",      width: 16 },
    { key: "vested",      width: 16 },
    { key: "vestedPct",   width: 14 },
    { key: "cliffDate",   width: 26 },
    { key: "fullyVested", width: 26 },
  ];

  ws.mergeCells("A1:G1");
  const title = ws.getCell("A1");
  title.value = "GRANT SUMMARY";
  title.fill = navyFill();
  title.font = { name: "Arial", bold: true, size: 11, color: { argb: "FF" + WHITE } };
  title.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 28;

  // Totals section
  let row = 2;
  ws.mergeCells(`A${row}:G${row}`);
  const tot = ws.getRow(row++);
  tot.getCell(1).value = "CONSOLIDATED TOTALS";
  tot.getCell(1).font = { name: "Arial", bold: true, size: 8, color: { argb: "FF" + MUTED } };
  tot.getCell(1).fill = offwhiteFill();

  const totalOptions = grants.reduce((s, g) => s + g.totalOptions, 0);
  const totalVested  = grants.reduce((s, g) => s + g.vestedCount, 0);

  const totRows: [string, string | number][] = [
    ["Number of Grants",                  grants.length],
    ["Total Options Granted",             totalOptions],
    ["Total Vested Options Today",        totalVested],
    ["Weighted Average Strike Price (CAD)", `$${weightedAvgStrike.toFixed(4)}`],
    ["Current Fully Diluted Shares",      globalDiluted],
    ["Current Ownership %",               globalDiluted > 0 ? `${((totalOptions / globalDiluted) * 100).toFixed(4)}%` : "—"],
  ];

  for (const [label, value] of totRows) {
    const r = ws.getRow(row);
    r.height = 20;
    const lc = r.getCell(1);
    lc.value = label;
    lc.font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY_HEX } };
    lc.fill = whiteFill(); lc.border = slateBorder();
    lc.alignment = { horizontal: "left", vertical: "middle" };
    const vc = r.getCell(2);
    vc.value = value;
    vc.font = { name: "Arial", bold: true, size: 9, color: { argb: "FF" + BLUE_HEX } };
    vc.fill = whiteFill(); vc.border = slateBorder();
    vc.alignment = { horizontal: "right", vertical: "middle" };
    // Merge cols 2-7 for the value
    ws.mergeCells(`B${row}:G${row}`);
    if (typeof value === "number") vc.numFmt = "#,##0";
    row++;
  }

  ws.getRow(row++).height = 10;

  // Per-grant table
  ws.mergeCells(`A${row}:G${row}`);
  const hdr = ws.getRow(row++);
  hdr.getCell(1).value = "PER-GRANT VESTING STATUS";
  hdr.getCell(1).font = { name: "Arial", bold: true, size: 8, color: { argb: "FF" + MUTED } };
  hdr.getCell(1).fill = offwhiteFill();

  const tableHeader = ws.getRow(row);
  ["Grant", "Options", "Strike", "Vested", "% Vested", "Cliff Date", "Fully Vested Date"].forEach((h, i) => {
    const cell = tableHeader.getCell(i + 1);
    cell.value = h;
    cell.alignment = { horizontal: i === 0 ? "left" : "right", vertical: "middle" };
  });
  applyNavyHeader(tableHeader, 7);
  row++;

  grants.forEach((g, i) => {
    const r = ws.getRow(row);
    r.height = 20;
    const fill = i % 2 === 0 ? whiteFill() : offwhiteFill();
    const cells: (string | number)[] = [
      g.label || `Grant ${i + 1}`,
      g.totalOptions,
      `$${g.strikePrice.toFixed(4)}`,
      g.vestedCount,
      `${g.vestedPct.toFixed(2)}%`,
      g.cliffDate || "—",
      g.fullyVestedDate || "—",
    ];
    cells.forEach((v, ci) => {
      const c = r.getCell(ci + 1);
      c.value = v;
      c.fill = fill; c.border = slateBorder();
      c.font = { name: "Arial", size: 9, bold: ci === 0, color: { argb: "FF" + (ci === 0 ? NAVY_HEX : MUTED) } };
      c.alignment = { horizontal: ci === 0 ? "left" : "right", vertical: "middle" };
      if (typeof v === "number") c.numFmt = "#,##0";
    });
    row++;
  });

  row++;
  ws.mergeCells(`A${row}:G${row}`);
  const nc = ws.getRow(row).getCell(1);
  nc.value = "For informational purposes only. Not financial or legal advice.  |  Rhino Ventures · rhinovc.com";
  nc.font = { name: "Arial", italic: true, size: 8, color: { argb: "FF" + MUTED } };
  nc.alignment = { horizontal: "left" };
}

// ── Sheet: Scenario Modeller ──────────────────────────────────────────────────

function buildScenarioSheet(
  ws: ExcelJS.Worksheet,
  scenarios: ScenarioResultMulti[],
  grants: GrantExport[],
  globalDiluted: number,
  weightedAvgStrike: number,
) {
  const multiGrant = grants.length > 1;

  ws.columns = [
    { key: "scenario",   width: 28 },
    { key: "valuation",  width: 24 },
    { key: "sharePrice", width: 20 },
    { key: "gain",       width: 20 },
    { key: "vested",     width: 24 },
    { key: "full",       width: 24 },
    { key: "multiple",   width: 18 },
  ];

  // Title
  ws.mergeCells("A1:G1");
  const title = ws.getCell("A1");
  title.value = "EXIT SCENARIO MODELLER";
  title.fill = navyFill();
  title.font = { name: "Arial", bold: true, size: 11, color: { argb: "FF" + WHITE } };
  title.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 28;

  // Params row
  ws.mergeCells("A2:G2");
  const params = ws.getCell("A2");
  params.value = `Current Fully Diluted Shares: ${globalDiluted.toLocaleString()}   |   Weighted Avg Strike: $${weightedAvgStrike.toFixed(4)}`;
  params.font = { name: "Arial", size: 8, color: { argb: "FF" + MUTED } };
  params.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(2).height = 18;

  // Header
  const headerRow = ws.getRow(3);
  const headers = [
    "Scenario",
    "Company Valuation (CAD)",
    "Implied Share Price",
    multiGrant ? "Wtd. Avg Gain / Option" : "Gain / Option",
    "Value of Vested Options",
    "Value of Full Grant",
    "Multiple on Strike",
  ];
  headers.forEach((h, i) => {
    const c = headerRow.getCell(i + 1);
    c.value = h;
    c.alignment = { horizontal: i === 0 ? "left" : "right", vertical: "middle" };
  });
  applyNavyHeader(headerRow, 7);

  const baseVal = weightedAvgStrike * globalDiluted;
  let excelRow = 4;

  scenarios.forEach((row) => {
    const hasBase      = globalDiluted > 0 && row.valuation > 0;
    const isInMoney    = hasBase && row.totalFullGrantValue > 0;
    const isUnderwater = hasBase && row.totalFullGrantValue === 0 && row.valuation < baseVal;

    const rowFill: ExcelJS.Fill = isInMoney     ? hexFill(GREEN_BG)
      : isUnderwater  ? hexFill(RED_BG)
      : excelRow % 2  ? offwhiteFill()
      : whiteFill();

    const valueHex  = isInMoney ? GREEN_TEXT : isUnderwater ? RED_TEXT : MUTED;
    const valueBold = isInMoney;

    const r = ws.getRow(excelRow);
    r.height = 20;

    // Label
    const lc = r.getCell(1);
    lc.value = row.label;
    lc.fill = rowFill; lc.border = slateBorder();
    lc.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF" + NAVY_HEX } };
    lc.alignment = { horizontal: "left", vertical: "middle" };

    // Valuation — yellow tint if editable (all rows are editable now)
    const vc = r.getCell(2);
    vc.value = row.valuation > 0 ? fmtValuation(row.valuation) : "—";
    vc.fill = hexFill(YELLOW_BG);
    vc.font = { name: "Arial", size: 9, color: { argb: "FF" + MUTED } };
    vc.alignment = { horizontal: "right", vertical: "middle" };
    vc.border = { ...slateBorder(), left: { style: "thin", color: { argb: "FF" + YELLOW_BORDER } } };

    const valCells: [number, string][] = [
      [3, hasBase ? fmtCAD(row.impliedSharePrice) : "—"],
      [4, hasBase ? (isInMoney ? fmtCAD(row.weightedGainPerOption) : "$0.00") : "—"],
      [5, hasBase ? (isInMoney ? fmtLargeCAD(row.totalVestedValue) : "$0.00") : "—"],
      [6, hasBase ? (isInMoney ? fmtLargeCAD(row.totalFullGrantValue) : "$0.00") : "—"],
      [7, hasBase ? fmtMultiple(row.multiple) : "—"],
    ];

    for (const [col, val] of valCells) {
      const c = r.getCell(col);
      c.value = val; c.fill = rowFill; c.border = slateBorder();
      c.font = { name: "Arial", size: 9, bold: valueBold, color: { argb: "FF" + valueHex } };
      c.alignment = { horizontal: "right", vertical: "middle" };
    }
    excelRow++;

    // Per-grant sub-rows
    if (multiGrant) {
      row.perGrant.forEach((pg) => {
        const subRow = ws.getRow(excelRow);
        subRow.height = 16;
        const subFill: ExcelJS.Fill = isInMoney ? hexFill("EBF7EF") : isUnderwater ? hexFill("FDF2F1") : offwhiteFill();
        const pgColor = pg.gainPerOption > 0 ? GREEN_TEXT : MUTED;

        const sc1 = subRow.getCell(1);
        sc1.value = `  ↳ ${pg.label}  @  $${pg.strike.toFixed(2)}`;
        sc1.fill = subFill; sc1.border = slateBorder();
        sc1.font = { name: "Arial", size: 8, italic: true, color: { argb: "FF" + NAVY_HEX } };
        sc1.alignment = { horizontal: "left", vertical: "middle" };

        const sc2 = subRow.getCell(2);
        sc2.value = `${pg.totalGrant.toLocaleString()} options`;
        sc2.fill = subFill; sc2.border = slateBorder();
        sc2.font = { name: "Arial", size: 8, color: { argb: "FF" + MUTED } };
        sc2.alignment = { horizontal: "right", vertical: "middle" };

        subRow.getCell(3).fill = subFill; subRow.getCell(3).border = slateBorder(); subRow.getCell(3).value = "—";
        subRow.getCell(3).font = { name: "Arial", size: 8, color: { argb: "FF" + MUTED } };
        subRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" };

        const subValCells: [number, string][] = [
          [4, hasBase ? (pg.gainPerOption > 0 ? fmtCAD(pg.gainPerOption) : "$0.00") : "—"],
          [5, hasBase ? (pg.gainPerOption > 0 ? fmtLargeCAD(pg.vestedValue) : "$0.00") : "—"],
          [6, hasBase ? (pg.gainPerOption > 0 ? fmtLargeCAD(pg.fullGrantValue) : "$0.00") : "—"],
        ];
        for (const [col, val] of subValCells) {
          const c = subRow.getCell(col);
          c.value = val; c.fill = subFill; c.border = slateBorder();
          c.font = { name: "Arial", size: 8, color: { argb: "FF" + pgColor } };
          c.alignment = { horizontal: "right", vertical: "middle" };
        }
        subRow.getCell(7).fill = subFill; subRow.getCell(7).border = slateBorder(); subRow.getCell(7).value = "—";
        subRow.getCell(7).font = { name: "Arial", size: 8, color: { argb: "FF" + MUTED } };
        subRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };

        excelRow++;
      });
    }
  });

  const noteIdx = excelRow + 1;
  ws.mergeCells(`A${noteIdx}:G${noteIdx}`);
  const nc = ws.getRow(noteIdx).getCell(1);
  nc.value = "For informational purposes only. Not financial or legal advice.  |  Rhino Ventures · rhinovc.com";
  nc.font = { name: "Arial", italic: true, size: 8, color: { argb: "FF" + MUTED } };
  nc.alignment = { horizontal: "left" };
}

// ── Public export function ────────────────────────────────────────────────────

export async function downloadOptionModellerXLSX(opts: ExportOptions): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator  = "Rhino Ventures Option Modeller";
  wb.created  = new Date();
  wb.modified = new Date();

  // One sheet per grant
  opts.grants.forEach((grant, i) => {
    const sheetName = grant.label ? grant.label.slice(0, 28) : `Grant ${i + 1}`;
    const ws = wb.addWorksheet(sheetName, { views: [{ showGridLines: false }] });
    buildGrantSheet(ws, grant, i + 1);
  });

  // Summary sheet
  const wsSummary = wb.addWorksheet("Summary", { views: [{ showGridLines: false }] });
  buildSummarySheet(wsSummary, opts.grants, opts.globalDiluted, opts.weightedAvgStrike);

  // Scenario Modeller sheet
  const wsScenario = wb.addWorksheet("Scenario Modeller", { views: [{ showGridLines: false }] });
  buildScenarioSheet(wsScenario, opts.scenarios, opts.grants, opts.globalDiluted, opts.weightedAvgStrike);

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url    = URL.createObjectURL(blob);
  const link   = document.createElement("a");
  link.href     = url;
  link.download = `Rhino_OptionModeller_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
