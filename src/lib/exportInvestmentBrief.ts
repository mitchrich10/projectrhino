import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";

const FONT = "Calibri";
const BODY_SIZE = 22; // 11pt
const HEADER_SIZE = 26; // 13pt
const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function txt(text: string, bold = false, size = BODY_SIZE): TextRun {
  return new TextRun({ text, bold, font: FONT, size });
}

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    children: [txt(text, true, HEADER_SIZE)],
  });
}

function bodyPara(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [txt(text || " ")],
  });
}

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "E8E8E8", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [txt(text, true)] })],
  });
}

function cell(text: string, width: number): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [txt(text)] })],
  });
}

export interface BriefFormData {
  company: string;
  owner: string;
  date: string;
  deadline: string;
  investmentType: string;
  investmentTypeOther: string;
  totalAsk: string;
  problem: string;
  inScope: string;
  outOfScope: string;
  roiRows: { lineItem: string; returnAmt: string; cost: string; paybackPeriod: string }[];
  returnTypes: string[];
  keyAssumptions: string;
  riskRows: { risk: string; likelihood: string; impact: string; mitigation: string }[];
  successRows: { metric: string; baseline: string; target: string; reviewDate: string; owner: string }[];
}

function buildDoc(data: BriefFormData, isTemplate: boolean): Document {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [txt("Investment Brief", true, 32)],
  }));

  // Header row
  const type = data.investmentType === "Other" ? data.investmentTypeOther : data.investmentType;
  const headerInfo = isTemplate
    ? "Company: ________    Owner: ________    Date: ________    Decision Deadline: ________"
    : `Company: ${data.company}    Owner: ${data.owner}    Date: ${data.date}    Decision Deadline: ${data.deadline}`;
  children.push(bodyPara(headerInfo));
  children.push(bodyPara(isTemplate ? "Investment Type: ________" : `Investment Type: ${type || "—"}`));
  children.push(bodyPara(isTemplate ? "Total Investment Ask: C$ ________" : `Total Investment Ask: C$ ${data.totalAsk || "—"}`));

  // Section 1
  children.push(heading("1. The Problem"));
  children.push(bodyPara(isTemplate
    ? "[What's broken or underperforming? What does inaction cost you? Use numbers where possible.]"
    : data.problem || "—"));

  // Section 2
  children.push(heading("2. The Investment"));
  const scopeW = 4680;
  children.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [scopeW, scopeW],
    rows: [
      new TableRow({ children: [headerCell("In Scope", scopeW), headerCell("Out of Scope", scopeW)] }),
      new TableRow({
        children: [
          cell(isTemplate ? "[Describe what is in scope]" : data.inScope || "—", scopeW),
          cell(isTemplate ? "[Describe what is out of scope]" : data.outOfScope || "—", scopeW),
        ],
      }),
    ],
  }));

  // Section 3 — ROI Model
  children.push(heading("3. ROI Model"));
  const roiColW = [2400, 1800, 1800, 1560, 1800];
  const roiHeader = new TableRow({
    children: ["Line Item", "Return (C$)", "Cost (C$)", "Multiple", "Payback Period"].map((h, i) =>
      headerCell(h, roiColW[i])
    ),
  });
  const roiDataRows = isTemplate
    ? [new TableRow({ children: roiColW.map(w => cell(" ", w)) })]
    : (data.roiRows.length > 0
        ? data.roiRows.map(r => {
            const ret = parseFloat(r.returnAmt) || 0;
            const cost = parseFloat(r.cost) || 0;
            const mult = cost > 0 ? (ret / cost).toFixed(1) + "x" : "—";
            return new TableRow({
              children: [
                cell(r.lineItem || "—", roiColW[0]),
                cell(r.returnAmt ? `$${Number(r.returnAmt).toLocaleString("en-CA")}` : "—", roiColW[1]),
                cell(r.cost ? `$${Number(r.cost).toLocaleString("en-CA")}` : "—", roiColW[2]),
                cell(mult, roiColW[3]),
                cell(r.paybackPeriod || "—", roiColW[4]),
              ],
            });
          })
        : [new TableRow({ children: roiColW.map(w => cell("—", w)) })]);

  children.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: roiColW,
    rows: [roiHeader, ...roiDataRows],
  }));

  const rtLabel = isTemplate ? "[Select: Revenue Uplift, Cost Reduction, Risk Mitigation, Time Saved]" : (data.returnTypes.length > 0 ? data.returnTypes.join(", ") : "—");
  children.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [txt("Return Type: ", true), txt(rtLabel)] }));
  children.push(new Paragraph({ spacing: { after: 120 }, children: [txt("Key Assumptions: ", true), txt(isTemplate ? "[List key assumptions]" : (data.keyAssumptions || "—"))] }));

  // Section 4 — Risks
  children.push(heading("4. Risks & Mitigations"));
  const riskColW = [3000, 1560, 1560, 3240];
  const riskHeader = new TableRow({
    children: ["Risk", "Likelihood", "Impact", "Mitigation"].map((h, i) =>
      headerCell(h, riskColW[i])
    ),
  });
  const riskDataRows = isTemplate
    ? [new TableRow({ children: riskColW.map(w => cell(" ", w)) })]
    : (data.riskRows.length > 0
        ? data.riskRows.map(r => new TableRow({
            children: [
              cell(r.risk || "—", riskColW[0]),
              cell(r.likelihood || "—", riskColW[1]),
              cell(r.impact || "—", riskColW[2]),
              cell(r.mitigation || "—", riskColW[3]),
            ],
          }))
        : [new TableRow({ children: riskColW.map(w => cell("—", w)) })]);

  children.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: riskColW,
    rows: [riskHeader, ...riskDataRows],
  }));

  // Section 5 — Success Metrics
  children.push(heading("5. Success Metrics"));
  const smColW = [2200, 1600, 1600, 1960, 2000];
  const smHeader = new TableRow({
    children: ["Metric", "Baseline", "Target", "Review Date", "Owner"].map((h, i) =>
      headerCell(h, smColW[i])
    ),
  });
  const smDataRows = isTemplate
    ? [new TableRow({ children: smColW.map(w => cell(" ", w)) })]
    : (data.successRows.length > 0
        ? data.successRows.map(r => new TableRow({
            children: [
              cell(r.metric || "—", smColW[0]),
              cell(r.baseline || "—", smColW[1]),
              cell(r.target || "—", smColW[2]),
              cell(r.reviewDate || "—", smColW[3]),
              cell(r.owner || "—", smColW[4]),
            ],
          }))
        : [new TableRow({ children: smColW.map(w => cell("—", w)) })]);

  children.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: smColW,
    rows: [smHeader, ...smDataRows],
  }));

  return new Document({
    styles: {
      default: {
        document: { run: { font: FONT, size: BODY_SIZE } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });
}

export async function exportBrief(data: BriefFormData) {
  const doc = buildDoc(data, false);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Investment_Brief_${data.company || "Draft"}.docx`);
}

export async function downloadTemplate() {
  const emptyData: BriefFormData = {
    company: "", owner: "", date: "", deadline: "",
    investmentType: "", investmentTypeOther: "", totalAsk: "",
    problem: "", inScope: "", outOfScope: "",
    roiRows: [], returnTypes: [], keyAssumptions: "",
    riskRows: [], successRows: [],
  };
  const doc = buildDoc(emptyData, true);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Investment_Brief_Template.docx");
}
