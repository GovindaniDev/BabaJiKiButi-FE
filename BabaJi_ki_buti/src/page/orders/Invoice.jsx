// src/utils/invoicePdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

/** Format INR (no paise) */
const inr0 = (n) => `₹ ${Number(n || 0).toFixed(2)}`;

/** Decide IGST vs CGST+SGST */
function gstSplit({ sellerState = "HR", shipState = "MH" }) {
  if (!sellerState || !shipState) return { type: "IGST" }; // fall back IGST
  return sellerState.toUpperCase() === shipState.toUpperCase()
    ? { type: "CGST_SGST" }
    : { type: "IGST" };
}

/**
 * Build a Flipkart-style Tax Invoice PDF and download.
 * @param {Object} ctx
 *  - order: { id, orderNumber, placedAt, invoiceNo?, items[], shipping?, paymentMethod?, trackingId? }
 *  - address: shipping address {name, address/line1, line2, locality, city, state, pincode, phone}
 *  - totals: { listing, special, fees, totalAmount }
 *  - seller: { name, gstin, pan, cin, addressLines[], stateCode, fromAddressLines[] }
 *  - options: { defaultGstPct=18, showSignature=true, policyLines[] }
 */
export async function buildFlipkartStyleInvoice({
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
      "Regd. office: ..., Faridnagar, Jhajjar, Haryana - 124103, IN-HR.",
    ],
    fromAddressLines: [
      "Ship-from Address: Rectangle No. 08, ..., District-Jhajjar, Haryana - 124103, IN-HR.",
    ],
  },
  options = {},
}) {
  const defaultGstPct = options.defaultGstPct ?? 18;

  const ship = address || order?.shipping || {};
  const split = gstSplit({ sellerState: seller.stateCode, shipState: ship?.state });

  // Build QR text (optional, safe to fail)
  let qrDataUrl = null;
  try {
    const qrPayload = `Invoice:${order?.invoiceNo || order?.orderNumber || order?.id}
Order:${order?.orderNumber || order?.id}
Total:${totals?.totalAmount}`;
    qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 0, width: 120 });
  } catch {}

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const margin = 36;

  // ------- Title -------
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text("Tax Invoice", width / 2, margin + 6, { align: "center" });

  // ------- Seller Box -------
  const topBoxY = margin + 20;
  doc.setFontSize(9).setFont("helvetica", "normal");

  // Seller name (bold)
  doc.setFont("helvetica", "bold");
  doc.text(`Sold By: ${seller.name}`, margin, topBoxY);
  doc.setFont("helvetica", "normal");

  const lines = [
    ...(seller.fromAddressLines || []),
    `GSTIN : ${seller.gstin}`,
  ];
  let y = topBoxY + 14;
  lines.forEach((t) => {
    doc.text(t, margin, y);
    y += 12;
  });

  // QR + Invoice No box
  const qrBoxX = width - margin - 170;
  const qrBoxY = topBoxY - 10;
  doc.roundedRect(qrBoxX, qrBoxY, 170, 70, 6, 6);
  if (qrDataUrl) doc.addImage(qrDataUrl, "PNG", qrBoxX + 10, qrBoxY + 10, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Number #", qrBoxX + 70, qrBoxY + 28);
  doc.setFont("helvetica", "normal");
  doc.text(String(order?.invoiceNo || `FAC7X${String(order?.id).replace(/\D/g, "").slice(-8).padStart(8, "0")}`), qrBoxX + 70, qrBoxY + 46);

  // ------- Meta Box (Order / Bill To / Ship To) -------
  const metaY = y + 10;
  autoTable(doc, {
    startY: metaY,
    styles: { fontSize: 9, cellPadding: 6, lineWidth: 0.2 },
    headStyles: { fillColor: [245, 245, 245], textColor: 0 },
    theme: "grid",
    body: [[
      {
        content:
          `Order ID:\n${order?.orderNumber || order?.id}\n\n` +
          `Order Date:\n${order?.placedAt ? new Date(order.placedAt).toLocaleDateString() : "-" }\n\n` +
          `Invoice Date:\n${order?.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString()}\n\n` +
          `PAN: ${seller.pan}\nCIN: ${seller.cin}`,
      },
      {
        content:
          `Bill To\n` +
          `${ship?.name || "-"}\n` +
          `${ship?.address || ship?.line1 || ""} ${ship?.line2 || ""}\n` +
          `${[ship?.locality, ship?.city, ship?.state, ship?.pincode || ship?.pinCode]
            .filter(Boolean).join(", ")}\n` +
          `Phone: ${ship?.phone || ship?.mobile || "-"}`,
      },
      {
        content:
          `Ship To\n` +
          `${ship?.name || "-"}\n` +
          `${ship?.address || ship?.line1 || ""} ${ship?.line2 || ""}\n` +
          `${[ship?.locality, ship?.city, ship?.state, ship?.pincode || ship?.pinCode]
            .filter(Boolean).join(", ")}\n` +
          `Phone: ${ship?.phone || ship?.mobile || "-"}` +
          `\n\n*Keep this invoice and manufacturer box for warranty purposes.`,
      }
    ]],
    columnStyles: {
      0: { cellWidth: 180 },
      1: { cellWidth: 200 },
      2: { cellWidth: 180 },
    },
  });

  // ------- Items table -------
// ------- Items table -------
const rows = [];
const gstPct = (it) => Number(it.gstRate ?? defaultGstPct) / 100;

(order?.items || []).forEach((it) => {
  const qty = Number(it.qty ?? it.quantity ?? 1);
  const price = Number(it.sellingPrice ?? it.price ?? 0);
  const mrp = Number(it.originalPrice ?? it.mrp ?? it.mrpPrice ?? price);
  const gross = price * qty;                 // price is tax-inclusive
  const discount = Math.max(0, (mrp - price) * qty);
  const taxable = +(gross / (1 + gstPct(it))).toFixed(2);
  const tax = +(gross - taxable).toFixed(2);

  const titleLines = [
    it.name || "Item",
    it.fsn ? `FSN: ${it.fsn}` : "",
    it.hsn ? `HSN/SAC: ${it.hsn}` : (it.hsnCode ? `HSN/SAC: ${it.hsnCode}` : ""),
    it.warranty ? `Warranty: ${it.warranty}` : "",
    split.type === "IGST" ? `IGST: ${(gstPct(it)*100).toFixed(0)} %` : `GST: ${(gstPct(it)*100).toFixed(0)} %`,
  ].filter(Boolean).join("\n");

  rows.push([
    { content: titleLines },
    { content: String(qty), styles: { halign: "right" } },
    { content: inr0(gross), styles: { halign: "right" } },
    { content: inr0(discount), styles: { halign: "right" } },
    { content: inr0(taxable), styles: { halign: "right" } },
    split.type === "IGST"
      ? { content: inr0(tax), styles: { halign: "right" } }
      : { content: `${inr0(tax/2)} + ${inr0(tax/2)}`, styles: { halign: "right" } },
    { content: inr0(gross), styles: { halign: "right" } },
  ]);
});

// Shipping row
const shippingCharge = Number(totals?.fees || 0) > 0 ? Number(totals.fees) : 0;
if (shippingCharge !== 0) {
  rows.push([
    { content: "Shipping And Handling Charges" },
    { content: "1", styles: { halign: "right" } },
    { content: inr0(Math.abs(shippingCharge)), styles: { halign: "right" } },
    { content: inr0(0), styles: { halign: "right" } },
    { content: inr0(0), styles: { halign: "right" } },
    split.type === "IGST"
      ? { content: inr0(0), styles: { halign: "right" } }
      : { content: `${inr0(0)} + ${inr0(0)}`, styles: { halign: "right" } },
    { content: inr0(Math.abs(shippingCharge)), styles: { halign: "right" } },
  ]);
}

// 👇 draw the "Total items" label ourselves with a numeric Y
// --- BEFORE (has didDrawPage that uses data.startY -> undefined) ---
// autoTable(doc, { ..., didDrawPage: (data) => {
//   doc.setFontSize(9).setFont("helvetica", "bold");
//   doc.text(`Total items: ${order?.items?.length || 0}`, margin, data.startY - 8);
// }});
const safeText = (t, x, y, opts) => {
  const nx = Number.isFinite(x) ? x : 0;
  const ny = Number.isFinite(y) ? y : 0;
  doc.text(String(t ?? ""), nx, ny, opts || {});
};

// --- AFTER (no didDrawPage; compute a real startY and draw label once) ---
const itemsStartY = (doc.lastAutoTable?.finalY || (metaY + 10)) + 10; // metaY = Y you used after the meta box
doc.setFontSize(9).setFont("helvetica", "bold");
doc.text(`Total items: ${order?.items?.length || 0}`, margin, itemsStartY - 6);

autoTable(doc, {
  startY: itemsStartY,
  theme: "grid",
  styles: { fontSize: 9, cellPadding: 6, lineWidth: 0.2 },
  headStyles: { fillColor: [245, 245, 245], textColor: 0 },
  head: [[
    "Title",
    "Qty",
    "Gross\nAmount ₹",
    "Discounts\n/Coupons ₹",
    "Taxable\nValue ₹",
    split.type === "IGST" ? "IGST ₹" : "CGST + SGST ₹",
    "Total ₹",
  ]],
  body: rows,
  columnStyles: {
    0: { cellWidth: 250 },
    1: { halign: "right", cellWidth: 40 },
    2: { halign: "right", cellWidth: 80 },
    3: { halign: "right", cellWidth: 90 },
    4: { halign: "right", cellWidth: 80 },
    5: { halign: "right", cellWidth: 90 },
    6: { halign: "right", cellWidth: 80 },
  },
});



  // Shipping row (optional discount against shipping)
    //   const shippingCharge =  Number(totals?.fees || 0) > 0 ? Number(totals.fees) : 0;
    //   if (shippingCharge !== 0) {
    //     // Example to show **Shipping and Handling Charges** and a coupon discount nullifying it
    //     rows.push([
    //       { content: "Shipping And Handling Charges" },
    //       { content: "1", styles: { halign: "right" } },
    //       { content: inr0(Math.abs(shippingCharge)), styles: { halign: "right" } },
    //       { content: inr0(0), styles: { halign: "right" } },
    //       { content: inr0(0), styles: { halign: "right" } },
    //       split.type === "IGST"
    //         ? { content: inr0(0), styles: { halign: "right" } }
    //         : { content: inr0(0) + " + " + inr0(0), styles: { halign: "right" } },
    //       { content: inr0(Math.abs(shippingCharge)), styles: { halign: "right" } },
    //     ]);
    //   }

//   autoTable(doc, {
//     startY: doc.lastAutoTable.finalY + 10,
//     theme: "grid",
//     styles: { fontSize: 9, cellPadding: 6, lineWidth: 0.2 },
//     headStyles: { fillColor: [245, 245, 245], textColor: 0 },
//     head: [[
//       "Title",
//       "Qty",
//       "Gross\nAmount ₹",
//       "Discounts\n/Coupons ₹",
//       "Taxable\nValue ₹",
//       split.type === "IGST" ? "IGST ₹" : "CGST + SGST ₹",
//       "Total ₹",
//     ]],
//     body: rows,
//     columnStyles: {
//       0: { cellWidth: 250 },
//       1: { halign: "right", cellWidth: 40 },
//       2: { halign: "right", cellWidth: 80 },
//       3: { halign: "right", cellWidth: 90 },
//       4: { halign: "right", cellWidth: 80 },
//       5: { halign: "right", cellWidth: 90 },
//       6: { halign: "right", cellWidth: 80 },
//     },
//     didDrawPage: (data) => {
//       // “Total items: n” small line like Flipkart
//       doc.setFontSize(9).setFont("helvetica", "bold");
//       doc.text(`Total items: ${order?.items?.length || 0}`, margin, data.startY - 8);
//     },
//   });

  // ------- Totals row at the bottom -------
  const tableEnd = doc.lastAutoTable.finalY;
  const grandY = tableEnd + 16;

  // Totals line (mirrors grid style)
  autoTable(doc, {
    startY: grandY,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 6 },
    body: [[
      { content: "Total", styles: { fontStyle: "bold" } },
      { content: String(order?.items?.reduce((a,i)=>a + Number(i.qty ?? i.quantity ?? 1), 0) || 0), styles:{ halign: "right", fontStyle:"bold"} },
      { content: inr0((order?.items||[]).reduce((s,i)=>s + (Number(i.sellingPrice ?? i.price ?? 0) * (Number(i.qty ?? i.quantity ?? 1))), 0) + Math.max(0, shippingCharge)), styles:{ halign:"right", fontStyle:"bold"} },
      { content: inr0((order?.items||[]).reduce((s,i)=>{
        const qty = Number(i.qty ?? i.quantity ?? 1);
        const mrp = Number(i.originalPrice ?? i.mrp ?? i.mrpPrice ?? Number(i.sellingPrice ?? i.price ?? 0));
        const rate = Number(i.sellingPrice ?? i.price ?? 0);
        return s + Math.max(0, (mrp - rate) * qty);
      },0)), styles:{ halign:"right", fontStyle:"bold"} },
      { content: "", styles:{ halign:"right"} },
      { content: "", styles:{ halign:"right"} },
      { content: inr0((totals?.totalAmount ?? 0)), styles:{ halign:"right", fontStyle:"bold"} },
    ]],
    columnStyles: {
      0: { cellWidth: 250 },
      1: { cellWidth: 40 },
      2: { cellWidth: 80 },
      3: { cellWidth: 90 },
      4: { cellWidth: 80 },
      5: { cellWidth: 90 },
      6: { cellWidth: 80 },
    }
  });

  // “Grand Total” box on right
  const rightX = width - margin - 220;
  const grandBoxY = doc.lastAutoTable.finalY + 18;
  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text("Grand Total", rightX, grandBoxY);
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text(inr0(totals?.totalAmount || 0), rightX + 140, grandBoxY, { align: "right" });

  // Seller name + Authorized Signatory
  const signY = grandBoxY + 28;
  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text(seller.name, rightX, signY);
  if (options.showSignature !== false) {
    // (Optional) If you have a base64 image for signature, add here:
    // doc.addImage(signaturePng, "PNG", rightX, signY + 4, 120, 40);
  }
  doc.text("Authorized Signatory", rightX, signY + 56);

  // ------- Footer policy -------
  const footY = doc.internal.pageSize.getHeight() - 70;
  doc.setDrawColor(210);
  doc.line(margin, footY - 10, width - margin, footY - 10);

  const policy = options.policyLines || [
    "Returns Policy: In case you need to return, please do so with the original Brand box/price tag, original packing and invoice.",
    "The goods sold are intended for end user consumption and not for re-sale.",
    "Contact Support: support@babajikibuti.com · https://www.babajikibuti.com/help",
  ];
  doc.setFontSize(9).setFont("helvetica", "normal");
  policy.forEach((t, i) => doc.text(t, margin, footY + i * 12));

  // Save
  const filename = `Invoice_${order?.invoiceNo || order?.orderNumber || order?.id}.pdf`;
  doc.save(filename);
}
