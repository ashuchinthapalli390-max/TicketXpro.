import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export async function generateCryptographicTicket(transaction: any) {
  console.log("Initializing PDF generation for transaction:", transaction.id);
  try {
    // 1. Prepare Cryptographic & Metadata
    const rawData = `${transaction.id}:${transaction.title}:${transaction.amount}:${transaction.category}`;
    const enc = new TextEncoder();
    const signatureBuffer = await crypto.subtle.digest('SHA-256', enc.encode(rawData));
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16).toUpperCase();

    // Primary Colors (TicketX Pro Palette)
    const colors = {
      primary: [242, 125, 38], // #F27D26 (Orange)
      accent: [45, 212, 191],  // #2DD4BF (Teal)
      bg: [255, 255, 255],     // White for ink-saving
      textDark: [17, 24, 39], // Gray-900
      textMuted: [107, 114, 128], // Gray-500
      highlightBg: [249, 250, 251] // Gray-50
    };

    // 2. Generate Stylized QR Code
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(JSON.stringify({
        txId: transaction.id || 'TX_UNKNOWN',
        sig: signatureHex,
        v: '1.0'
      }), { 
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 10,
        color: {
          dark: '#2DD4BF', // Teal
          light: '#FFFFFF'
        }
      });
    } catch (qrErr) {
      console.error("QR Code generation failed:", qrErr);
    }

  // 3. Initialize PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5' // Landscape A5 is perfect for tickets
  });
  
  const width = 210;
  const height = 148;

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, 'F');

  // Left Section (Movie Poster) - 30%
  const posterWidth = width * 0.35;
  
  // Placeholder or real poster
  try {
    if (transaction.imageUrl) {
      // For now we use the URL directly, jsPDF supports it if CORS is okay
      doc.addImage(transaction.imageUrl, 'JPEG', 0, 0, posterWidth, height, undefined, 'FAST');
    } else {
      doc.setFillColor(20, 20, 20);
      doc.rect(0, 0, posterWidth, height, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text('POSTER UNAVAILABLE', posterWidth / 2, height / 2, { align: 'center' });
    }
  } catch (e) {
    console.warn("Poster load failed for PDF:", e);
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, posterWidth, height, 'F');
  }

  // Right Section (Information) - 70%
  const infoX = posterWidth + 10;
  const contentWidth = width - infoX - 10;

  // Branding Header
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TicketX', infoX, 15);
  
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('Pro', infoX + 24, 15);

  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'underline');
  doc.text('Thanks for choosing us for your cinematic experience!', width - 10, 14, { align: 'right' });

  // Movie Title
  const titleY = 32;
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize((transaction.title || 'UNKNOWN MOVIE').toUpperCase(), contentWidth);
  doc.text(titleLines, infoX, titleY);

  const titleHeight = titleLines.length * 10;
  let currentY = titleY + titleHeight + 2;

  // Language & Format
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const format = transaction.selection?.format || '4K DIGITAL / DOLBY ATMOS';
  doc.text(`ENGLISH / ${format}`, infoX, currentY);

  currentY += 12;

  // Theater Details Card
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(infoX, currentY, contentWidth, 32, 2, 2, 'F');
  
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('THEATRICAL EXPERIENCE', infoX + 5, currentY + 5);

  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(transaction.venue || 'PREMIUM CINEMA HALL', infoX + 5, currentY + 12);

  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const addr = transaction.selection?.address || 'Main Road, Near Central Square, Narasaraopet, AP';
  const addressLines = doc.splitTextToSize(addr, contentWidth - 10);
  doc.text(addressLines, infoX + 5, currentY + 17);

  const screen = transaction.selection?.screen || 'AUDI 02';
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(infoX + contentWidth - 25, currentY + 5, 20, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(screen, infoX + contentWidth - 15, currentY + 10.5, { align: 'center' });

  currentY += 38;

  // Showtime & Seats
  // Left: DateTime Box
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(infoX, currentY, contentWidth * 0.55, 22, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('SCHEDULED SHOWTIME', infoX + 5, currentY + 6);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const dStr = transaction.selection?.date || new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const tStr = transaction.selection?.time || '06:30 PM';
  doc.text(`${dStr.toUpperCase()} | ${tStr}`, infoX + 5, currentY + 15);

  // Right: Seat Number
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(7);
  doc.text('CONFIRMED SEATS', infoX + contentWidth * 0.6 , currentY + 6);
  
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const seatsArr = transaction.selection?.seats || ['J-14', 'J-15'];
  const seats = Array.isArray(seatsArr) ? seatsArr.join(', ') : seatsArr;
  doc.text(seats, infoX + contentWidth * 0.6, currentY + 16);

  currentY += 30;

  // Payment & Security Section
  // Left: Payment Table
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(7);
  doc.text('PAYMENT & VALIDATION', infoX, currentY);

  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`REFERENCE: ${transaction.id.toUpperCase().substring(0, 12)}`, infoX, currentY + 6);
  doc.text(`GATEWAY: ${transaction.selection?.paymentMethod || 'SECURE CARD'}`, infoX, currentY + 11);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`PAID: INR ${transaction.amount}.00`, infoX, currentY + 20);

  // Bottom Right: QR Code
  const qrSize = 38;
  const qrX = width - qrSize - 10;
  const qrY = height - qrSize - 12;

  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('SCAN AT ENTRY', qrX + (qrSize / 2), qrY - 3, { align: 'center' });
  
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Bottom Footer
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(6);
  doc.text(`VERIFICATION HASH: 0x${signatureHex}`, infoX, height - 5);
  doc.text('POWERED BY TICKETX PRO SECURE INFRASTRUCTURE • DIGITAL TICKET VERSION 2.1', width - 10, height - 5, { align: 'right' });

  // Save the PDF
  const safeTitle = (transaction.title || 'Ticket').replace(/\s+/g, '_');
  doc.save(`TicketX_Pro_${safeTitle}.pdf`);
  console.log("PDF generation complete.");
  } catch (err) {
    console.error("Critical PDF Generation Error:", err);
    alert("Failed to generate PDF ticket. Please try again or contact support.");
  }
}
