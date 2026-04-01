import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
} from "docx";
import { saveAs } from "file-saver";

const FONT = "Calibri";
const BODY_SIZE = 22; // 11pt in half-points
const HEADER_SIZE = 26; // 13pt
const TITLE_SIZE = 32; // 16pt
const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function txt(text: string, bold = false, size = BODY_SIZE): TextRun {
  return new TextRun({ text, bold, font: FONT, size });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 360, after: 160 },
    children: [txt(text, true, HEADER_SIZE)],
  });
}

function bodyPara(text: string, spacing?: { before?: number; after?: number }): Paragraph {
  return new Paragraph({
    spacing: { after: 100, ...spacing },
    children: [txt(text || " ")],
  });
}

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [txt(label, true), txt(value || "—")],
  });
}

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [txt(text, true)] })],
  });
}

function dataCell(text: string, width: number): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [txt(text)] })],
  });
}

function fmtDollar(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface BriefFormData {
  company: string;
  owner: string;
  date: string;
  investmentType: string;
  investmentTypeOther: string;
  totalAsk: string;
  problem: string;
  inScope: string;
  outOfScope: string;
  roiRows: { lineItem: string; returnAmt: string; cost: string; paybackPeriod: string }[];
  returnTypes: string[];
  keyAssumptions: string;
  successRows: { metric: string; baseline: string; target: string; reviewDate: string; owner: string }[];
}

function buildDoc(data: BriefFormData, isTemplate: boolean): Document {
  const children: (Paragraph | Table)[] = [];

  // ── Title ──
  children.push(new Paragraph({
    spacing: { after: 80 },
    children: [txt("Project Proposal", true, TITLE_SIZE)],
  }));

  // ── Divider line ──
  children.push(new Paragraph({
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 1 } },
    children: [txt(" ")],
  }));

  // ── Header info as label:value pairs ──
  const type = data.investmentType === "Other" ? data.investmentTypeOther : data.investmentType;

  if (isTemplate) {
    children.push(labelValue("Company: ", "________"));
    children.push(labelValue("Owner: ", "________"));
    children.push(labelValue("Date: ", "________"));
    children.push(labelValue("Investment Type: ", "________"));
    children.push(labelValue("Total Investment Ask: ", "C$ ________"));
  } else {
    children.push(labelValue("Company: ", data.company));
    children.push(labelValue("Owner: ", data.owner));
    children.push(labelValue("Date: ", data.date));
    children.push(labelValue("Investment Type: ", type));
    const totalAskNum = parseFloat(data.totalAsk.replace(/,/g, ""));
    children.push(labelValue("Total Investment Ask: ", isNaN(totalAskNum) ? (data.totalAsk || "—") : ("C" + fmtDollar(String(totalAskNum)))));
  }

  // ── Section 1: The Problem ──
  children.push(sectionHeading("1. The Problem"));
  children.push(bodyPara(isTemplate
    ? "[What's broken or underperforming? What does inaction cost you? Use numbers where possible.]"
    : data.problem));

  // ── Section 2: The Investment ──
  children.push(sectionHeading("2. The Investment"));
  const scopeW = 4680;
  children.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [scopeW, scopeW],
    rows: [
      new TableRow({ children: [headerCell("In Scope", scopeW), headerCell("Out of Scope", scopeW)] }),
      new TableRow({
        children: [
          dataCell(isTemplate ? "[Describe what is in scope]" : (data.inScope || "—"), scopeW),
          dataCell(isTemplate ? "[Describe what is out of scope]" : (data.outOfScope || "—"), scopeW),
        ],
      }),
    ],
  }));

  // ── Section 3: ROI Model ──
  children.push(sectionHeading("3. ROI Model"));
  const roiColW = [2400, 1800, 1800, 1560, 1800];
  const roiHeader = new TableRow({
    children: ["Line Item", "Return (C$)", "Cost (C$)", "Multiple", "Payback Period"].map((h, i) =>
      headerCell(h, roiColW[i])
    ),
  });

  const roiDataRows = isTemplate
    ? [new TableRow({ children: roiColW.map(w => dataCell(" ", w)) }),
       new TableRow({ children: roiColW.map(w => dataCell(" ", w)) })]
    : (data.roiRows.length > 0
        ? data.roiRows.map(r => {
            const ret = parseFloat(r.returnAmt) || 0;
            const cost = parseFloat(r.cost) || 0;
            const mult = cost > 0 ? (ret / cost).toFixed(1) + "x" : "—";
            return new TableRow({
              children: [
                dataCell(r.lineItem || "—", roiColW[0]),
                dataCell(r.returnAmt ? fmtDollar(r.returnAmt) : "—", roiColW[1]),
                dataCell(r.cost ? fmtDollar(r.cost) : "—", roiColW[2]),
                dataCell(mult, roiColW[3]),
                dataCell(r.paybackPeriod || "—", roiColW[4]),
              ],
            });
          })
        : [new TableRow({ children: roiColW.map(w => dataCell("—", w)) })]);

  children.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: roiColW,
    rows: [roiHeader, ...roiDataRows],
  }));

  // Return Type & Key Assumptions
  children.push(new Paragraph({ spacing: { before: 200 }, children: [] }));
  const rtLabel = isTemplate
    ? "[Select: Revenue Uplift, Cost Reduction, Risk Mitigation, Time Saved, Other]"
    : (data.returnTypes.length > 0 ? data.returnTypes.join(", ") : "—");
  children.push(labelValue("Return Type: ", rtLabel));
  children.push(new Paragraph({ spacing: { before: 120 }, children: [] }));
  children.push(labelValue("Key Assumptions: ", ""));
  children.push(bodyPara(isTemplate ? "[List key assumptions]" : (data.keyAssumptions || "—")));

  // ── Section 4: Success Metrics ──
  children.push(sectionHeading("4. Success Metrics"));
  const smColW = [2200, 1600, 1600, 1960, 2000];
  const smHeader = new TableRow({
    children: ["Metric", "Baseline", "Target", "Review Date", "Owner"].map((h, i) =>
      headerCell(h, smColW[i])
    ),
  });
  const smDataRows = isTemplate
    ? [new TableRow({ children: smColW.map(w => dataCell(" ", w)) }),
       new TableRow({ children: smColW.map(w => dataCell(" ", w)) })]
    : (data.successRows.length > 0
        ? data.successRows.map(r => new TableRow({
            children: [
              dataCell(r.metric || "—", smColW[0]),
              dataCell(r.baseline || "—", smColW[1]),
              dataCell(r.target || "—", smColW[2]),
              dataCell(r.reviewDate || "—", smColW[3]),
              dataCell(r.owner || "—", smColW[4]),
            ],
          }))
        : [new TableRow({ children: smColW.map(w => dataCell("—", w)) })]);

  children.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: smColW,
    rows: [smHeader, ...smDataRows],
  }));

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BODY_SIZE },
        },
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
  saveAs(blob, `Project_Proposal_${data.company || "Draft"}.docx`);
}

export async function downloadTemplate() {
  const emptyData: BriefFormData = {
    company: "", owner: "", date: "",
    investmentType: "", investmentTypeOther: "", totalAsk: "",
    problem: "", inScope: "", outOfScope: "",
    roiRows: [], returnTypes: [], keyAssumptions: "",
    successRows: [],
  };
  const doc = buildDoc(emptyData, true);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Project_Proposal_Template.docx");
}
