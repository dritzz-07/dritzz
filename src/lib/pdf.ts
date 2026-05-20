import { jsPDF } from 'jspdf';
import { BookingDetails, Package } from '../types';

export const generateInvoice = async (details: BookingDetails, pkg: Package, amount: number, paymentMethod: string, refId: string, status: string = 'completed') => {
  const doc = new jsPDF();
  
  // Header Background
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Try to load and add the logo from SVG
  try {
    const svgStr = `<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 100 220 L 164 60 H 420 C 500 60 436 220 356 220 H 180 L 196 180 H 372 C 412 180 444 100 404 100 H 188 L 140 220 Z" fill="white" fill-rule="evenodd" />
      <text x="300" y="340" font-family="helvetica, -apple-system, sans-serif" font-weight="950" font-style="italic" font-size="110" fill="white" text-anchor="middle" style="letter-spacing: -0.02em; text-transform: uppercase;">DRITZZ</text>
    </svg>`;
    const getLogoDataUrl = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 600;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load logo SVG'));
        };
        img.src = url;
      });
    };
    
    const logoDataUrl = await getLogoDataUrl();
    doc.addImage(logoDataUrl, 'PNG', 15, 8, 42, 28);
  } catch (err) {
    console.error('Failed to add logo to PDF', err);
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bolditalic');
    doc.text('DRITZZ', 20, 28);
  }

  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.setFont('helvetica', 'normal');
  doc.text('PREMIUM DOORSTEP CAR WASH', 140, 25);
  doc.text('dritzz.info@gmail.com | +91 7075504625', 140, 30);

  // Status Badge
  if (status === 'cancelled') {
    doc.setFillColor(255, 235, 235);
    doc.roundedRect(160, 50, 30, 8, 2, 2, 'F');
    doc.setTextColor(200, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CANCELLED', 175, 55.5, { align: 'center' });
  } else {
    doc.setFillColor(235, 255, 235);
    doc.roundedRect(170, 50, 20, 8, 2, 2, 'F');
    doc.setTextColor(0, 150, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID', 180, 55.5, { align: 'center' });
  }

  // Main Section
  doc.setTextColor(20, 20, 20);
  
  // Invoice text
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 65);
  
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'bold');
  doc.text('REFERENCE ID', 20, 75);
  doc.text('ISSUE DATE', 70, 75);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(refId, 20, 81);
  doc.text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 70, 81);

  // Customer & Details Block
  doc.setFillColor(248, 248, 250);
  doc.roundedRect(20, 95, 170, 40, 3, 3, 'F');
  
  // Bill To
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 120);
  doc.text('BILLED TO', 28, 106);
  doc.setTextColor(20, 20, 20);
  doc.text(details.name, 28, 114);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(details.phone, 28, 120);
  doc.text(details.email || 'N/A', 28, 126);
  
  // Service Details
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 120);
  doc.text('SERVICE SCHEDULE', 110, 106);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(details.date, 110, 114);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Time: ${details.timeSlot}`, 110, 120);
  doc.text(`Vehicle: ${details.vehicleType.toUpperCase()}`, 110, 126);
  
  // Table Header
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(20, 150, 170, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRIPTION', 28, 156.5);
  doc.text('QTY', 125, 156.5);
  doc.text('AMOUNT', 182, 156.5, { align: 'right' });
  
  // Table Body
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text(`${pkg.name} Package`, 28, 172);
  doc.text('1', 125, 172);
  doc.text(`Rs. ${amount.toFixed(2)}`, 182, 172, { align: 'right' });
  
  // Summary Lines
  doc.setLineWidth(0.3);
  doc.setDrawColor(220, 220, 220);
  doc.line(110, 190, 190, 190);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 125, 198);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rs. ${amount.toFixed(2)}`, 182, 198, { align: 'right' });
  
  doc.line(110, 204, 190, 204);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text('TOTAL', 125, 214);
  doc.text(`Rs. ${amount.toFixed(2)}`, 182, 214, { align: 'right' });
  
  // Payment Info
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', 20, 190);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Method: ${paymentMethod.toUpperCase()}`, 20, 196);
  doc.text(`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`, 20, 201);
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(240, 240, 240);
  doc.line(20, pageHeight - 35, 190, pageHeight - 35);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'bold');
  doc.text('THANK YOU FOR YOUR TRUST', 105, pageHeight - 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer generated invoice and does not require a physical signature.', 105, pageHeight - 20, { align: 'center' });
  
  // Save PDF
  doc.save(`Dritzz_Invoice_${refId}.pdf`);
};
