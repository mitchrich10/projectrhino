import ExcelJS from "exceljs";

// Brand colours
const NAVY_HEX      = "173660";
const BLUE_HEX      = "1A7EC8";
const OFFWHITE      = "F4F7FA";
const SLATE         = "CDD8E3";
const MUTED         = "5C6B7A";
const WHITE         = "FFFFFF";
const YELLOW_BG     = "FFFACD";
const YELLOW_BORDER = "E8C43A";
// Row tint colours
const GREEN_BG  = "D6F0E0";
const GREEN_TEXT = "1A6B3C";
const RED_BG    = "FBEAE8";
const RED_TEXT  = "A33222";

function fmtValuationLabel(n: number): string {
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

function fmtLargeCADLabel(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0.00";
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${(v < 100 && v % 1 !== 0) ? v.toFixed(1) : v.toFixed(0)}M`;
  }
  return new Intl.NumberFormat("en-CA", {
    style: "currency", currency: "CAD", maximumFractionDigits: 2,
  }).format(n);
}

function fmtCAD(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0.00";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtMultiple(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  return `${n.toFixed(2)}x`;
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function navyFill(): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + NAVY_HEX } };
}
function offwhiteFill(): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + OFFWHITE } };
}
function whiteFill(): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + WHITE } };
}
function hexFill(hex: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + hex } };
}
function slateBorder(): Partial<ExcelJS.Borders> {
  const s: ExcelJS.Border = { style: "thin", color: { argb: "FF" + SLATE } };
  return { top: s, left: s, bottom: s, right: s };
}

function applyNavyHeader(row: ExcelJS.Row, colCount: number) {
  row.height = 24;
  row.eachCell((cell, colNum) => {
    if (colNum > colCount) return;
    cell.fill = navyFill();
    cell.font = { name: "Arial", bold: true, size: 9, color: { argb: "FF" + WHITE } };
    cell.alignment = { horizontal: colNum === 1 ? "left" : "right", vertical: "middle" };
    cell.border = slateBorder();
  });
}

// ── Sheet 1 — My Grant ────────────────────────────────────────────────────────

interface GrantInputs {
  totalOptions: string;
  strikePrice: string;
  fullyDiluted: string;
  grantDate: string;
  todayDate: string;
  ownershipPct: number;
  vestedOptions: number;
  monthsVested: number;
}

function buildGrantSheet(ws: ExcelJS.Worksheet, inputs: GrantInputs) {
  ws.columns = [
    { key: "label", width: 34 },
    { key: "value", width: 24 },
  ];

  ws.mergeCells("A1:B1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "MY GRANT";
  titleCell.fill = navyFill();
  titleCell.font = { name: "Arial", bold: true, size: 11, color: { argb: "FF" + WHITE } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 28;

  const inputRows: [string, string | number][] = [
    ["Total Options Granted",            inputs.totalOptions ? Number(inputs.totalOptions) : "—"],
    ["Strike Price per Share (CAD)",      inputs.strikePrice  ? `$${Number(inputs.strikePrice).toFixed(4)}` : "—"],
    ["Fully Diluted Shares Outstanding",  inputs.fullyDiluted ? Number(inputs.fullyDiluted) : "—"],
    ["Vesting Schedule",                  "4-year / 1-year cliff"],
    ["Grant Date",                        inputs.grantDate || "—"],
    ["Today's Date",                      inputs.todayDate || "—"],
  ];

  let rowIdx = 2;

  const secInput = ws.getRow(rowIdx++);
  secInput.getCell(1).value = "INPUTS";
  secInput.getCell(1).font = { name: "Arial", bold: true, size: 8, color: { argb: "FF" + MUTED } };
  secInput.getCell(1).fill = offwhiteFill();
  ws.mergeCells(`A${rowIdx - 1}:B${rowIdx - 1}`);

  for (const [label, value] of inputRows) {
    const row = ws.getRow(rowIdx);
    row.height = 20;
    const lc = row.getCell(1);
    lc.value = label;
    lc.font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY_HEX } };
    lc.fill = whiteFill();
    lc.alignment = { horizontal: "left", vertical: "middle" };
    lc.border = slateBorder();
    const vc = row.getCell(2);
    vc.value = value;
    vc.font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY_HEX } };
    vc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + YELLOW_BG } };
    vc.border = { ...slateBorder(), left: { style: "thin", color: { argb: "FF" + YELLOW_BORDER } } };
    vc.alignment = { horizontal: "right", vertical: "middle" };
    if (typeof value === "number") {
      vc.numFmt = label.includes("Strike") ? undefined : "#,##0";
    }
    rowIdx++;
  }

  ws.getRow(rowIdx++).height = 6;

  const secDerived = ws.getRow(rowIdx++);
  secDerived.getCell(1).value = "DERIVED OUTPUTS";
  secDerived.getCell(1).font = { name: "Arial", bold: true, size: 8, color: { argb: "FF" + MUTED } };
  secDerived.getCell(1).fill = offwhiteFill();
  ws.mergeCells(`A${rowIdx - 1}:B${rowIdx - 1}`);

  const derivedRows: [string, string | number][] = [
    ["% Ownership (to 4 decimal places)", inputs.fullyDiluted && inputs.totalOptions
      ? `${inputs.ownershipPct.toFixed(4)}%` : "—"],
    ["Vested Options Today",              inputs.vestedOptions > 0 ? inputs.vestedOptions : "—"],
    ["Months Vested",                     inputs.monthsVested > 0  ? inputs.monthsVested  : "—"],
  ];

  for (const [label, value] of derivedRows) {
    const row = ws.getRow(rowIdx);
    row.height = 20;
    const lc = row.getCell(1);
    lc.value = label;
    lc.font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY_HEX } };
    lc.fill = whiteFill();
    lc.alignment = { horizontal: "left", vertical: "middle" };
    lc.border = slateBorder();
    const vc = row.getCell(2);
    vc.value = value;
    vc.font = { name: "Arial", bold: true, size: 9, color: { argb: "FF" + BLUE_HEX } };
    vc.fill = whiteFill();
    vc.border = slateBorder();
    vc.alignment = { horizontal: "right", vertical: "middle" };
    if (typeof value === "number") vc.numFmt = "#,##0";
    rowIdx++;
  }

  rowIdx++;
  ws.mergeCells(`A${rowIdx}:B${rowIdx}`);
  const nc = ws.getRow(rowIdx).getCell(1);
  nc.value = "For informational purposes only. Not financial or legal advice.  |  Rhino Ventures · rhinovc.com";
  nc.font = { name: "Arial", italic: true, size: 8, color: { argb: "FF" + MUTED } };
  nc.alignment = { horizontal: "left" };
}

// ── Sheet 2 — Scenario Modeller ───────────────────────────────────────────────

interface ScenarioResult {
  id: string;
  label: string;
  editable: boolean;
  valuation: number;
  impliedSharePrice: number;
  gainPerOption: number;
  vestedValue: number;
  fullGrantValue: number;
  multiple: number;
}

function buildScenarioSheet(
  ws: ExcelJS.Worksheet,
  scenarios: ScenarioResult[],
  diluted: number,
  strike: number,
) {
  ws.columns = [
    { key: "scenario",   width: 26 },
    { key: "valuation",  width: 22 },
    { key: "sharePrice", width: 20 },
    { key: "gain",       width: 18 },
    { key: "vestedVal",  width: 22 },
    { key: "fullGrant",  width: 22 },
    { key: "multiple",   width: 18 },
  ];

  const headers = [
    "Scenario",
    "Company Valuation (CAD)",
    "Implied Share Price",
    "Gain / Option",
    "Value of Vested",
    "Value of Full Grant",
    "Multiple on Strike",
  ];

  ws.mergeCells("A1:G1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "EXIT SCENARIO MODELLER";
  titleCell.fill = navyFill();
  titleCell.font = { name: "Arial", bold: true, size: 11, color: { argb: "FF" + WHITE } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 28;

  const headerRow = ws.getRow(2);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.alignment = { horizontal: i === 0 ? "left" : "right", vertical: "middle" };
  });
  applyNavyHeader(headerRow, headers.length);

  const baseVal = strike * diluted;

  scenarios.forEach((row, i) => {
    const excelRow = ws.getRow(i + 3);
    excelRow.height = 20;

    const hasBase      = diluted > 0 && strike > 0 && row.valuation > 0;
    const isInMoney    = hasBase && row.gainPerOption > 0;
    const isUnderwater = hasBase && row.gainPerOption <= 0 && row.valuation < baseVal;
    const isAuto       = row.id === "base" || row.id === "two_x";

    const rowFill: ExcelJS.Fill = isInMoney    ? hexFill(GREEN_BG)
      : isUnderwater ? hexFill(RED_BG)
      : i % 2 === 0  ? whiteFill()
      : offwhiteFill();

    const valueHex  = isInMoney ? GREEN_TEXT : isUnderwater ? RED_TEXT : MUTED;
    const valueBold = isInMoney;

    const setLabel = (cell: ExcelJS.Cell) => {
      cell.fill = rowFill; cell.border = slateBorder();
      cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF" + NAVY_HEX } };
      cell.alignment = { horizontal: "left", vertical: "middle" };
    };
    const setVal = (cell: ExcelJS.Cell) => {
      cell.fill = rowFill; cell.border = slateBorder();
      cell.font = { name: "Arial", size: 9, bold: valueBold, color: { argb: "FF" + valueHex } };
      cell.alignment = { horizontal: "right", vertical: "middle" };
    };

    const labelCell = excelRow.getCell(1);
    labelCell.value = row.label + (isAuto ? "  [Auto]" : "");
    setLabel(labelCell);

    const valCell = excelRow.getCell(2);
    valCell.value = row.valuation > 0 ? fmtValuationLabel(row.valuation) : "—";
    valCell.fill = row.editable
      ? { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + YELLOW_BG } }
      : rowFill;
    valCell.font  = { name: "Arial", size: 9, color: { argb: "FF" + MUTED } };
    valCell.alignment = { horizontal: "right", vertical: "middle" };
    valCell.border = row.editable
      ? { ...slateBorder(), left: { style: "thin", color: { argb: "FF" + YELLOW_BORDER } } }
      : slateBorder();

    const spCell = excelRow.getCell(3);
    spCell.value = hasBase ? fmtCAD(row.impliedSharePrice) : "—";
    setVal(spCell);

    const gpCell = excelRow.getCell(4);
    gpCell.value = hasBase ? (isInMoney ? fmtCAD(row.gainPerOption) : "$0.00") : "—";
    setVal(gpCell);

    const vvCell = excelRow.getCell(5);
    vvCell.value = hasBase ? (isInMoney ? fmtLargeCADLabel(row.vestedValue) : "$0.00") : "—";
    setVal(vvCell);

    const fgCell = excelRow.getCell(6);
    fgCell.value = hasBase ? (isInMoney ? fmtLargeCADLabel(row.fullGrantValue) : "$0.00") : "—";
    setVal(fgCell);

    const mulCell = excelRow.getCell(7);
    mulCell.value = hasBase ? fmtMultiple(row.multiple) : "—";
    setVal(mulCell);
  });

  const noteIdx = scenarios.length + 4;
  ws.mergeCells(`A${noteIdx}:G${noteIdx}`);
  const nc = ws.getRow(noteIdx).getCell(1);
  nc.value = "For informational purposes only. Not financial or legal advice.  |  Rhino Ventures · rhinovc.com";
  nc.font = { name: "Arial", italic: true, size: 8, color: { argb: "FF" + MUTED } };
  nc.alignment = { horizontal: "left" };
}

// ── Public export function ────────────────────────────────────────────────────

export interface ExportOptions {
  inputs: GrantInputs;
  scenarios: ScenarioResult[];
  diluted: number;
  strike: number;
}

export async function downloadOptionModellerXLSX(opts: ExportOptions): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator  = "Rhino Ventures Option Modeller";
  wb.created  = new Date();
  wb.modified = new Date();

  const ws1 = wb.addWorksheet("My Grant",          { views: [{ showGridLines: false }] });
  const ws2 = wb.addWorksheet("Scenario Modeller", { views: [{ showGridLines: false }] });

  buildGrantSheet(ws1, opts.inputs);
  buildScenarioSheet(ws2, opts.scenarios, opts.diluted, opts.strike);

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `Rhino_OptionModeller_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
