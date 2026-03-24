import ExcelJS from "exceljs";

// ── Brand palette (ARGB) ──────────────────────────────────────────────────────
const C_NAVY     = "FF173660";
const C_BLUE     = "FF1A7EC8";
const C_MINT     = "FFA3D7C2";
const C_SLATE    = "FFCDD8E3";
const C_OFFWHITE = "FFF4F7FA";
const C_CLIFF    = "FFF4F4F4";
const C_GREY     = "FF5C6B7A";
const C_WHITE    = "FFFFFFFF";

// ── Types (mirrored from page) ────────────────────────────────────────────────
export interface PlanInputs {
  role: string;
  territory: string;
  planPeriod: string;
  annualQuota: string;
  baseSalary: string;
  targetBonus: string;
  equity: string;
  monthlyWeight: string;
  quarterlyWeight: string;
  annualWeight: string;
  cliffThreshold: string;
  acceleratorThreshold: string;
  acceleratorMultiplier: string;
  psRate: string;
}

export interface AttainmentRow {
  attainment: number;
  monthlyBonus: number;
  quarterlyBonus: number;
  annualBonus: number;
  totalBonus: number;
  baseBonus: number;
  vsOTE: number;
}

export interface RepSnapshot {
  periodType: string;
  periodQuota: number;
  actual: number;
  attainmentPct: number;
  periodBonus: number;
  psCollected: number;
  psEarned: number;
  proRatedBase: number;
  totalPeriodEarnings: number;
  aboveBelow: number;
  statusLabel: string;
  annualisedRunRate: number;
  psRate: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function fmtCAD(v: number): string {
  const abs  = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    const n = abs / 1_000_000_000;
    return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    const n = abs / 1_000_000;
    return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const n = abs / 1_000;
    return `${sign}$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

// ── Styling helpers ───────────────────────────────────────────────────────────
type WsBorder = ExcelJS.Border;

const thinBorder: Partial<WsBorder> = { style: "thin", color: { argb: C_SLATE } };

function borderAll(cell: ExcelJS.Cell) {
  cell.border = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };
}

function navyHeader(cell: ExcelJS.Cell, bold = true) {
  cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: C_NAVY } };
  cell.font   = { name: "Arial", bold, color: { argb: C_WHITE }, size: 10 };
  cell.alignment = { vertical: "middle", horizontal: "left" };
  borderAll(cell);
}

function labelCell(cell: ExcelJS.Cell) {
  cell.font      = { name: "Arial", bold: true, color: { argb: C_GREY }, size: 9 };
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: C_OFFWHITE } };
  cell.alignment = { vertical: "middle" };
  borderAll(cell);
}

function valueCell(cell: ExcelJS.Cell, argbColor = C_NAVY) {
  cell.font      = { name: "Arial", color: { argb: argbColor }, size: 10 };
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: C_WHITE } };
  cell.alignment = { vertical: "middle" };
  borderAll(cell);
}

// ── Sheet 1 — Plan Inputs ─────────────────────────────────────────────────────
function buildPlanSheet(ws: ExcelJS.Worksheet, plan: PlanInputs, ote: number, totalPkg: number) {
  ws.getColumn(1).width = 36;
  ws.getColumn(2).width = 22;

  const addHeader = (title: string) => {
    const r = ws.addRow([title, ""]);
    ws.mergeCells(r.number, 1, r.number, 2);
    navyHeader(ws.getCell(r.number, 1));
    r.height = 22;
  };

  const addRow = (label: string, value: string, valColor = C_NAVY) => {
    const r = ws.addRow([label, value]);
    r.height = 18;
    labelCell(ws.getCell(r.number, 1));
    valueCell(ws.getCell(r.number, 2), valColor);
  };

  // ─ Section: Rep Details
  addHeader("REP DETAILS");
  addRow("Role / Title",    plan.role     || "—");
  addRow("Territory",       plan.territory || "—");
  addRow("Plan Period",     plan.planPeriod || "—");
  ws.addRow([]);

  // ─ Section: Compensation
  addHeader("COMPENSATION");
  addRow("Annual Quota (CAD)",       fmtCAD(parseNum(plan.annualQuota)));
  addRow("Base Salary (CAD)",        fmtCAD(parseNum(plan.baseSalary)));
  addRow("Target Bonus at 100%",     fmtCAD(parseNum(plan.targetBonus)));
  addRow("Equity Value (CAD)",       plan.equity ? fmtCAD(parseNum(plan.equity)) : "—");
  ws.addRow([]);

  // ─ Section: OTE (hero)
  addHeader("OTE & TOTAL PACKAGE");
  addRow("OTE at 100% (Base + Target Bonus)",    fmtCAD(ote),      C_BLUE);
  addRow("Total Annual Package (OTE + Equity)",  fmtCAD(totalPkg), C_BLUE);
  ws.addRow([]);

  // ─ Section: Bonus Weights
  addHeader("BONUS STRUCTURE — WEIGHTS");
  addRow("Monthly Weight",   `${plan.monthlyWeight || "25"}%`);
  addRow("Quarterly Weight", `${plan.quarterlyWeight || "25"}%`);
  addRow("Annual Weight",    `${plan.annualWeight || "50"}%`);
  ws.addRow([]);

  // ─ Section: Cliff & Accelerator
  addHeader("CLIFF & ACCELERATOR SETTINGS");
  addRow("Cliff Threshold (no bonus below)",          `${plan.cliffThreshold || "85"}%`);
  addRow("Accelerator Threshold",                     `${plan.acceleratorThreshold || "110"}%`);
  addRow("Accelerator Multiplier",                    `${plan.acceleratorMultiplier || "2"}×`);
  addRow("Professional Services Commission Rate",     `${plan.psRate || "4"}%`);
}

// ── Sheet 2 — Attainment Table ────────────────────────────────────────────────
function buildAttainmentSheet(
  ws: ExcelJS.Worksheet,
  rows: AttainmentRow[],
  cliff: number,
  accel: number
) {
  ws.getColumn(1).width = 14;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 18;
  ws.getColumn(5).width = 22;
  ws.getColumn(6).width = 18;
  ws.getColumn(7).width = 12;

  const headers = ["Attainment", "Monthly Bonus (per mo.)", "Quarterly Bonus (per qtr)", "Annual Bonus (tranche)", "Total Bonus (Annualised)", "Base + Total Bonus", "vs. OTE"];
  const hRow = ws.addRow(headers);
  hRow.height = 22;
  hRow.eachCell((cell) => navyHeader(cell));

  rows.forEach((r) => {
    const tier = r.attainment / 100 < cliff ? "cliff"
      : r.attainment / 100 >= accel ? "accel"
      : r.attainment >= 100 ? "at-target"
      : "partial";

    const bgArgb     = tier === "cliff" ? C_CLIFF : tier === "accel" ? C_MINT : C_WHITE;
    const bonusArgb  = tier === "cliff" ? C_GREY : tier === "at-target" ? C_BLUE : C_NAVY;
    const zeroBonus  = tier === "cliff";

    const label = r.attainment + "%"
      + (r.attainment === 100  ? " (Target)"      : "")
      + (tier === "accel"      ? " [Accel]"        : "")
      + (tier === "cliff"      ? " [Below Cliff]"  : "");

    const dr = ws.addRow([
      label,
      zeroBonus ? "$0" : fmtCAD(r.monthlyBonus),
      zeroBonus ? "$0" : fmtCAD(r.quarterlyBonus),
      zeroBonus ? "$0" : fmtCAD(r.annualBonus),
      zeroBonus ? "$0" : fmtCAD(r.totalBonus),
      fmtCAD(r.baseBonus),
      `${r.vsOTE.toFixed(0)}%`,
    ]);
    dr.height = 17;

    dr.eachCell((cell, colNum) => {
      const isBonusCol = colNum >= 2 && colNum <= 5;
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
      cell.font      = { name: "Arial", size: 10, color: { argb: isBonusCol ? bonusArgb : C_NAVY }, bold: colNum === 1 };
      cell.alignment = { vertical: "middle" };
      borderAll(cell);
    });
  });

  // Legend note
  ws.addRow([]);
  const noteRow = ws.addRow(["Grey = below cliff (no bonus) · Blue text = at target · Mint fill = above accelerator (exceptional)"]);
  ws.mergeCells(noteRow.number, 1, noteRow.number, 7);
  const nc = ws.getCell(noteRow.number, 1);
  nc.font      = { name: "Arial", italic: true, color: { argb: C_GREY }, size: 9 };
  nc.alignment = { horizontal: "left" };
}

// ── Sheet 3 — Rep Calculator ──────────────────────────────────────────────────
function buildRepSheet(ws: ExcelJS.Worksheet, snap: RepSnapshot) {
  ws.getColumn(1).width = 36;
  ws.getColumn(2).width = 22;

  const addHeader = (title: string) => {
    const r = ws.addRow([title, ""]);
    ws.mergeCells(r.number, 1, r.number, 2);
    navyHeader(ws.getCell(r.number, 1));
    r.height = 22;
  };

  const addRow = (label: string, value: string, valColor = C_NAVY) => {
    const r = ws.addRow([label, value]);
    r.height = 18;
    labelCell(ws.getCell(r.number, 1));
    valueCell(ws.getCell(r.number, 2), valColor);
  };

  addHeader("REP CALCULATOR — PERIOD INPUTS");
  addRow("Period Type",   snap.periodType.charAt(0).toUpperCase() + snap.periodType.slice(1));
  addRow("Period Quota",  fmtCAD(snap.periodQuota));
  addRow("Actual Orders / Revenue", fmtCAD(snap.actual));
  if (snap.psCollected > 0)
    addRow("Professional Services Collected", fmtCAD(snap.psCollected));
  ws.addRow([]);

  addHeader("STATUS");
  addRow("Attainment Status", snap.statusLabel);
  ws.addRow([]);

  addHeader("EARNINGS BREAKDOWN");
  addRow("Attainment %",                `${(snap.attainmentPct * 100).toFixed(1)}%`);
  addRow(snap.aboveBelow >= 0 ? "Above Target" : "Below Target",
    (snap.aboveBelow >= 0 ? "+" : "") + fmtCAD(snap.aboveBelow),
    snap.aboveBelow >= 0 ? C_BLUE : "FFA33222");
  addRow(`Pro-rated Base (${snap.periodType})`, fmtCAD(snap.proRatedBase));
  addRow("Bonus Earned This Period",    fmtCAD(snap.periodBonus),       C_BLUE);
  if (snap.psCollected > 0)
    addRow(`PS Commission (${snap.psRate}%)`, fmtCAD(snap.psEarned), C_BLUE);
  addRow("Total Period Earnings",       fmtCAD(snap.totalPeriodEarnings), C_BLUE);
  if (snap.periodType !== "annual")
    addRow("Annualised Run-rate",       fmtCAD(snap.annualisedRunRate),   C_NAVY);
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function downloadCommissionXLSX(
  plan: PlanInputs,
  rows: AttainmentRow[],
  repSnap: RepSnapshot
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Rhino Ventures Commission Calculator";
  wb.created  = new Date();

  const base      = parseNum(plan.baseSalary);
  const bonus     = parseNum(plan.targetBonus);
  const equity    = parseNum(plan.equity);
  const ote       = base + bonus;
  const totalPkg  = ote + equity;
  const cliff     = parseNum(plan.cliffThreshold) / 100;
  const accel     = parseNum(plan.acceleratorThreshold) / 100;

  buildPlanSheet(       wb.addWorksheet("Plan Inputs"),       plan, ote, totalPkg);
  buildAttainmentSheet( wb.addWorksheet("Attainment Table"),  rows, cliff, accel);
  buildRepSheet(        wb.addWorksheet("Rep Calculator"),    repSnap);

  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `RhinoVC_CommissionPlan_${plan.planPeriod.replace(/\s+/g, "_") || "2026"}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
