import jsPDF from "jspdf";

interface PartnershipData {
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  promo_code: string | null;
  redemption_url: string | null;
}

export function generatePartnershipPdf(partnership: PartnershipData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Header bar — Navy
  doc.setFillColor(23, 54, 96); // #173660
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("RHINO VENTURES", margin, 14);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Partnership Details", margin, 24);

  y = 44;

  // Accent line
  doc.setFillColor(26, 126, 200); // #1A7EC8
  doc.rect(margin, y, contentWidth, 0.8, "F");
  y += 8;

  // Partner name
  doc.setTextColor(23, 54, 96);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(partnership.name, margin, y);
  y += 8;

  // Category badge text
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 126, 200);
  doc.text(partnership.category.toUpperCase(), margin, y);
  y += 6;

  if (partnership.tagline) {
    doc.setFontSize(11);
    doc.setTextColor(92, 107, 122);
    doc.text(partnership.tagline, margin, y);
    y += 8;
  }

  y += 4;

  // Description
  if (partnership.description) {
    doc.setFontSize(10);
    doc.setTextColor(23, 54, 96);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(partnership.description, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 8;
  }

  // Promo code
  if (partnership.promo_code) {
    doc.setFillColor(26, 126, 200);
    doc.rect(margin, y, contentWidth, 0.5, "F");
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(92, 107, 122);
    doc.setFont("helvetica", "bold");
    doc.text("PROMO CODE", margin, y);
    y += 6;

    doc.setFontSize(14);
    doc.setTextColor(26, 126, 200);
    doc.setFont("helvetica", "bold");
    doc.text(partnership.promo_code, margin, y);
    y += 10;
  }

  // Redemption URL
  if (partnership.redemption_url) {
    doc.setFontSize(9);
    doc.setTextColor(92, 107, 122);
    doc.setFont("helvetica", "bold");
    doc.text("HOW TO REDEEM", margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(26, 126, 200);
    doc.setFont("helvetica", "normal");
    doc.textWithLink(partnership.redemption_url, margin, y, { url: partnership.redemption_url });
    y += 10;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFontSize(8);
  doc.setTextColor(160, 170, 180);
  doc.setFont("helvetica", "normal");
  doc.text("Rhino Ventures · rhinovc.com · 2026", margin, footerY);

  doc.save(`${partnership.name.replace(/\s+/g, "-").toLowerCase()}-details.pdf`);
}
