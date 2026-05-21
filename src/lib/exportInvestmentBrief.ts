import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  BorderStyle, WidthType, ShadingType,
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

function dataCell(text: string, width: number, bold = false): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [txt(text, bold)] })],
  });
}

function fmtDollar(val: number | string): string {
  const n = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  returnTypeRows: { type: string; amount: string }[];
  totalReturn: number;
  multiple: string;
  paybackPeriod: string;
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

  // ── Divider ──
  children.push(new Paragraph({
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 1 } },
    children: [txt(" ")],
  }));

  // ── Header info ──
  const type = data.investmentType === "Other" ? data.investmentTypeOther : data.investmentType;
  const costNum = parseFloat((data.totalAsk || "").replace(/,/g, "")) || 0;

  if (isTemplate) {
    children.push(labelValue("Company: ", "________"));
    children.push(labelValue("Owner: ", "________"));
    children.push(labelValue("Date: ", "________"));
    children.push(labelValue("Investment Type: ", "________"));
    children.push(labelValue("Total Investment Ask: ", "________"));
  } else {
    children.push(labelValue("Company: ", data.company));
    children.push(labelValue("Owner: ", data.owner));
    children.push(labelValue("Date: ", data.date));
    children.push(labelValue("Investment Type: ", type));
    children.push(labelValue("Total Investment Ask: ", costNum > 0 ? fmtDollar(costNum) : (data.totalAsk || "—")));
  }

  // ── Section 1 ──
  children.push(sectionHeading("1. The Problem"));
  children.push(bodyPara(isTemplate
    ? "[What's broken or underperforming? What does inaction cost you? Use numbers where possible.]"
    : data.problem));

  // ── Section 2 ──
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
  const roiColW = [5360, 4000];
    const roiHeader = new TableRow({
    children: [headerCell("Return Type", roiColW[0]), headerCell("Value", roiColW[1])],
  });

  let roiRows: TableRow[];
  if (isTemplate) {
    roiRows = [
      new TableRow({ children: [dataCell("[e.g. Revenue Uplift]", roiColW[0]), dataCell(" ", roiColW[1])] }),
      new TableRow({ children: [dataCell("[e.g. Cost Reduction]", roiColW[0]), dataCell(" ", roiColW[1])] }),
    ];
  } else if (data.returnTypeRows.length > 0) {
    roiRows = data.returnTypeRows.map(r =>
      new TableRow({
        children: [
          dataCell(r.type || "—", roiColW[0]),
          dataCell(r.amount ? fmtDollar(r.amount) : "—", roiColW[1]),
        ],
      })
    );
  } else {
    roiRows = [new TableRow({ children: [dataCell("—", roiColW[0]), dataCell("—", roiColW[1])] })];
  }

  // Totals rows
  const totalsRows = isTemplate ? [] : [
    new TableRow({
      children: [
        new TableCell({
          borders, width: { size: roiColW[0], type: WidthType.DXA }, margins: cellMargins,
          shading: { fill: "F9F9F9", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [txt("Total Return", true)] })],
        }),
        new TableCell({
          borders, width: { size: roiColW[1], type: WidthType.DXA }, margins: cellMargins,
          shading: { fill: "F9F9F9", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [txt(fmtDollar(data.totalReturn), true)] })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders, width: { size: roiColW[0], type: WidthType.DXA }, margins: cellMargins,
          shading: { fill: "F9F9F9", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [txt("Total Cost", true)] })],
        }),
        new TableCell({
          borders, width: { size: roiColW[1], type: WidthType.DXA }, margins: cellMargins,
          shading: { fill: "F9F9F9", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [txt(fmtDollar(costNum), true)] })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders, width: { size: roiColW[0], type: WidthType.DXA }, margins: cellMargins,
          shading: { fill: "EFEFEF", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [txt("Multiple (Return ÷ Cost)", true)] })],
        }),
        new TableCell({
          borders, width: { size: roiColW[1], type: WidthType.DXA }, margins: cellMargins,
          shading: { fill: "EFEFEF", type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [txt(data.multiple || "—", true)] })],
        }),
      ],
    }),
  ];

  children.push(new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: roiColW,
    rows: [roiHeader, ...roiRows, ...totalsRows],
  }));

  children.push(new Paragraph({ spacing: { before: 200 }, children: [] }));
  children.push(labelValue("Payback Period: ", isTemplate ? "[e.g. 6 months]" : (data.paybackPeriod || "—")));
  children.push(new Paragraph({ spacing: { before: 120 }, children: [] }));
  children.push(labelValue("Key Assumptions: ", ""));
  children.push(bodyPara(isTemplate ? "[List key assumptions]" : (data.keyAssumptions || "—")));

  // ── Section 4 ──
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
  saveAs(blob, `Project_Proposal_${data.company || "Draft"}.docx`);
}

export async function downloadTemplate() {
  const emptyData: BriefFormData = {
    company: "", owner: "", date: "",
    investmentType: "", investmentTypeOther: "", totalAsk: "",
    problem: "", inScope: "", outOfScope: "",
    returnTypeRows: [], totalReturn: 0, multiple: "—", paybackPeriod: "",
    keyAssumptions: "",
    successRows: [],
  };
  const doc = buildDoc(emptyData, true);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Project_Proposal_Template.docx");
}
