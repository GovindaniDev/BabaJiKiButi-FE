// src/utils/invoicePdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

/** Helpers */
const inr = (n) => {
  const v = Number(n || 0);
  return `₹ ${v.toFixed(2)}`;
};
const gstSplit = (sellerState, shipState) =>
  (sellerState || "").toUpperCase() === (shipState || "").toUpperCase()
    ? "CGST_SGST"
    : "IGST";

/**
 * Build a Flipkart-style invoice PDF and download it.
 *
 * @param {Object} ctx
 *  - order: {
 *      id, orderNumber, placedAt, invoiceNo?, invoiceDate?,
 *      items: [{
 *        name, qty, quantity, price, sellingPrice, mrp, originalPrice,
 *        fsn?, hsn?, hsnCode?, warranty?, gstRate?
 *      }],
 *      paymentMethod?, trackingId?, shipping?  // optional
 *    }
 *  - address: {name, address/line1, line2, locality, city, state, pincode/pinCode, phone}
 *  - totals: { listing, special, fees, totalAmount }
 *  - seller: {
 *      name, gstin, pan, cin, stateCode,
 *      fromAddressLines: string[], addressLines: string[]
 *    }
 *  - options?: {
 *      defaultGstPct?: number,
 *      brandName?: string,
 *      brandLogoBase64?: string,                 // optional top-left brand
 *      thankYouBase64?: string,                  // optional bottom-right badge
 *      signatureBase64?: string,                 // optional sign image
 *      filenamePrefix?: string                   // default "Invoice_"
 *    }
 */
export async function buildFlipkartInvoice({
  order,
  address,
  totals,
  seller = {
    name: "Tech-Connect Retail Private Limited",
    gstin: "06AAICA4872D1ZS",
    pan: "AAICA4872D",
    cin: "U52100HR2010PTC068415",
    stateCode: "HR",
    addressLines: [
      "Regd. office: Rectangle No. 06, Rectangle No. 08 and Rectangle No. 13, Village- Khaliqpur, Tehsil- Bahli,",
      "District- Jhajjar/F.C- FarukhNagar, Jhajjar, Haryana - 124103, IN-HR."
    ],
    fromAddressLines: [
      "Ship-from Address: Rectangle No. 08, ..., Jhajjar, Haryana - 124103, IN-HR."
    ],
  },
  options = {}
}) {
  const {
    defaultGstPct = 18,
    brandName = "Babaji Ki Buti",
    brandLogoBase64 = null, // optional
    thankYouBase64 = null,  // optional
    signatureBase64 = null, // optional
    filenamePrefix = "Invoice_",
  } = options;

  const ship = address || order?.shipping || {};
  const taxMode = gstSplit(seller.stateCode, ship.state);
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // page metrics
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 36;

  // ---------- Title ----------
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text("Tax Invoice", W / 2, M + 6, { align: "center" });

  // ---------- Seller header (left) ----------
  let y = M + 24;
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text(`Sold By: ${seller.name}`, M, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  const leftLines = [
    ...(seller.fromAddressLines || []),
    `GSTIN : ${seller.gstin}`
  ];
  leftLines.forEach((t) => {
    doc.text(String(t), M, y);
    y += 12;
  });

  // Optional brand logo (top-left)
  if (brandLogoBase64) {
    try {
      doc.addImage(brandLogoBase64, "PNG", M, M - 6, 90, 26);
    } catch {}
  }

  // ---------- QR + Invoice box (right) ----------
  const qrBoxW = 170, qrBoxH = 70;
  const qrX = W - M - qrBoxW;
  const qrY = M + 10;
  doc.roundedRect(qrX, qrY, qrBoxW, qrBoxH, 6, 6);

  // Build QR text
  let qrDataUrl = null;
  try {
    const qrText =
      `Invoice:${order?.invoiceNo || order?.orderNumber || order?.id}\n` +
      `Order:${order?.orderNumber || order?.id}\n` +
      `Total:${totals?.totalAmount}`;
    qrDataUrl = await QRCode.toDataURL(qrText, { margin: 0, width: 120 });
  } catch {}

  if (qrDataUrl) doc.addImage(qrDataUrl, "PNG", qrX + 10, qrY + 10, 50, 50);

  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text("Invoice Number #", qrX + 72, qrY + 26);
  doc.setFont("helvetica", "normal");
  const invNum =
    order?.invoiceNo ||
    `FAC7X${String(order?.id ?? order?.orderNumber ?? "0").replace(/\D/g, "").slice(-8).padStart(8, "0")}`;
  doc.text(String(invNum), qrX + 72, qrY + 44);

  // ---------- Meta 3-column table ----------
  const metaStartY = Math.max(y + 8, qrY + qrBoxH + 10);
  const metaCols = [
    {
      k: "order",
      content:
        `Order ID:\n${order?.orderNumber || order?.id}\n\n` +
        `Order Date:\n${order?.placedAt ? new Date(order.placedAt).toLocaleDateString() : "-"}\n\n` +
        `Invoice Date:\n${order?.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString()}\n\n` +
        `PAN: ${seller.pan}\nCIN: ${seller.cin}`
    },
    {
      k: "bill",
      content:
        `Bill To\n` +
        `${ship?.name || "-"}\n` +
        `${(ship?.address || ship?.line1 || "")} ${(ship?.line2 || "")}\n` +
        `${[ship?.locality, ship?.city, ship?.state, ship?.pincode || ship?.pinCode].filter(Boolean).join(", ")}\n` +
        `Phone: ${ship?.phone || ship?.mobile || "-"}`
    },
    {
      k: "ship",
      content:
        `Ship To\n` +
        `${ship?.name || "-"}\n` +
        `${(ship?.address || ship?.line1 || "")} ${(ship?.line2 || "")}\n` +
        `${[ship?.locality, ship?.city, ship?.state, ship?.pincode || ship?.pinCode].filter(Boolean).join(", ")}\n` +
        `Phone: ${ship?.phone || ship?.mobile || "-"}\n\n` +
        `*Keep this invoice and manufacturer box for warranty purposes.`
    }
  ];

  autoTable(doc, {
    startY: metaStartY,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 6, lineWidth: 0.2 },
    headStyles: { fillColor: [245, 245, 245], textColor: 0 },
    body: [[
      { content: metaCols[0].content },
      { content: metaCols[1].content },
      { content: metaCols[2].content }
    ]],
    columnStyles: {
      0: { cellWidth: 190 },
      1: { cellWidth: 210 },
      2: { cellWidth: 190 },
    }
  });

  // "Total items: n" label
  const itemsStartY = (doc.lastAutoTable?.finalY || metaStartY) + 12;
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.text(`Total items: ${order?.items?.length || 0}`, M, itemsStartY - 6);

  // ---------- Items table ----------
  const rows = [];
  const pct = (it) => Number(it?.gstRate ?? defaultGstPct);
  const pctF = (it) => `${pct(it)}%`;

  (order?.items || []).forEach((it) => {
    const qty = Number(it.qty ?? it.quantity ?? 1);
    const rate = Number(it.sellingPrice ?? it.price ?? 0);
    const mrp  = Number(it.originalPrice ?? it.mrp ?? it.mrpPrice ?? rate);
    const gross = rate * qty; // tax-inclusive
    const discount = Math.max(0, (mrp - rate) * qty);
    const taxable = +(gross / (1 + pct(it)/100)).toFixed(2);
    const tax = +(gross - taxable).toFixed(2);

    const productCol = [
      it.productType || "Product",
      it.fsn ? `FSN: ${it.fsn}` : null,
      it.hsn ? `HSN/SAC: ${it.hsn}` : (it.hsnCode ? `HSN/SAC: ${it.hsnCode}` : null)
    ].filter(Boolean).join("\n");

    const titleCol = [
      it.name || "Item",
      it.warranty ? `Warranty: ${it.warranty}` : null,
      `IGST: ${pctF(it)}`
    ].filter(Boolean).join("\n");

    rows.push([
      { content: productCol },
      { content: titleCol },
      { content: String(qty), styles: { halign: "right" } },
      { content: inr(gross), styles: { halign: "right" } },
      { content: inr(discount), styles: { halign: "right" } },
      { content: inr(taxable), styles: { halign: "right" } },
      taxMode === "IGST"
        ? { content: inr(tax), styles: { halign: "right" } }
        : { content: `${inr(tax/2)} + ${inr(tax/2)}`, styles: { halign: "right" } },
      { content: inr(gross), styles: { halign: "right" } },
    ]);
  });

  // Shipping row (if any)
  const shippingCharge = Number(totals?.fees || 0) > 0 ? Number(totals.fees) : 0;
  if (shippingCharge) {
    rows.push([
      { content: "—" },
      { content: "Shipping And Handling Charges" },
      { content: "1", styles: { halign: "right" } },
      { content: inr(Math.abs(shippingCharge)), styles: { halign: "right" } },
      { content: inr(0), styles: { halign: "right" } },
      { content: inr(0), styles: { halign: "right" } },
      taxMode === "IGST"
        ? { content: inr(0), styles: { halign: "right" } }
        : { content: `${inr(0)} + ${inr(0)}`, styles: { halign: "right" } },
      { content: inr(Math.abs(shippingCharge)), styles: { halign: "right" } },
    ]);
  }

  autoTable(doc, {
    startY: itemsStartY,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 6, lineWidth: 0.2 },
    headStyles: { fillColor: [245, 245, 245], textColor: 0 },
    head: [[
      "Product",
      "Title",
      "Qty",
      "Gross\nAmount ₹",
      "Discounts\n/Coupons ₹",
      "Taxable\nValue ₹",
      taxMode === "IGST" ? "IGST ₹" : "CGST + SGST ₹",
      "Total ₹",
    ]],
    body: rows,
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 260 },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 80, halign: "right" },
      4: { cellWidth: 90, halign: "right" },
      5: { cellWidth: 80, halign: "right" },
      6: { cellWidth: 90, halign: "right" },
      7: { cellWidth: 80, halign: "right" },
    }
  });

  // ---------- Totals strip (plain) ----------
  const totalsY = (doc.lastAutoTable?.finalY || itemsStartY) + 10;
  const totalQty = (order?.items || []).reduce((a, i) => a + Number(i.qty ?? i.quantity ?? 1), 0);
  const grossSum = (order?.items || []).reduce((s, i) => s + (Number(i.sellingPrice ?? i.price ?? 0) * Number(i.qty ?? i.quantity ?? 1)), 0) + Math.max(shippingCharge, 0);
  const discountSum = (order?.items || []).reduce((s, i) => {
    const qty = Number(i.qty ?? i.quantity ?? 1);
    const mrp = Number(i.originalPrice ?? i.mrp ?? i.mrpPrice ?? Number(i.sellingPrice ?? i.price ?? 0));
    const rate = Number(i.sellingPrice ?? i.price ?? 0);
    return s + Math.max(0, (mrp - rate) * qty);
  }, 0);

  autoTable(doc, {
    startY: totalsY,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 6 },
    body: [[
      { content: "Total", styles: { fontStyle: "bold" } },
      { content: String(totalQty), styles: { halign: "right", fontStyle: "bold" } },
      { content: inr(grossSum), styles: { halign: "right", fontStyle: "bold" } },
      { content: inr(discountSum), styles: { halign: "right", fontStyle: "bold" } },
      { content: "", styles: { halign: "right" } },
      { content: "", styles: { halign: "right" } },
      { content: inr(Number(totals?.totalAmount || 0)), styles: { halign: "right", fontStyle: "bold" } },
    ]],
    columnStyles: {
      0: { cellWidth: 350 },
      1: { cellWidth: 40 },
      2: { cellWidth: 80 },
      3: { cellWidth: 90 },
      4: { cellWidth: 80 },
      5: { cellWidth: 90 },
      6: { cellWidth: 80 },
    }
  });

  // ---------- Grand Total box (right) ----------
  const boxY = (doc.lastAutoTable?.finalY || totalsY) + 16;
  const boxX = W - M - 220;
  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text("Grand Total", boxX, boxY);
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text(inr(Number(totals?.totalAmount || 0)), boxX + 140, boxY, { align: "right" });

  // Seller & Signature
  const signY = boxY + 28;
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(seller.name, boxX, signY);
  if (signatureBase64) {
    try { doc.addImage(signatureBase64, "PNG", boxX, signY + 4, 120, 40); } catch {}
  }
  doc.text("Authorized Signatory", boxX, signY + 56);

  // ---------- Footer ----------
  const footTop = H - 80;
  doc.setDrawColor(210);
  doc.line(M, footTop, W - M, footTop);

  const policy = [
    "Returns Policy: In case you need to return, please do so with the original Brand box/price tag, original packing and invoice.",
    "The goods sold are intended for end user consumption and not for re-sale."
  ];
  doc.setFont("helvetica", "normal").setFontSize(9);
  policy.forEach((t, i) => doc.text(t, M, footTop + 16 + i * 12));

  const contact = `${brandName} • support@babajikibuti.com • https://www.babajikibuti.com/help`;
  doc.text(contact, M, H - 28);

  // Optional “Thank You” badge (bottom-right)
  if (thankYouBase64) {
    try { doc.addImage(thankYouBase64, "PNG", W - M - 120, H - 90, 110, 40); } catch {}
  }

  const fname = `${filenamePrefix}${order?.invoiceNo || order?.orderNumber || order?.id}.pdf`;
  doc.save(fname);
}
