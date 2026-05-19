import { jsPDF } from 'jspdf';
import { BookingDetails, Package } from '../types';

export const generateInvoice = (details: BookingDetails, pkg: Package, amount: number, paymentMethod: string, refId: string) => {
  const doc = new jsPDF();
  
  // Brand Header
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('DRITZZ', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PREMIUM DOORSTEP CAR WASH', 105, 26, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Invoice Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE / BILL', 20, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking Ref: ${refId}`, 140, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 55);
  
  // Customer Details
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(details.name, 20, 76);
  doc.text(details.phone, 20, 81);
  doc.text(details.email || 'N/A', 20, 86);
  doc.text(details.address, 20, 91, { maxWidth: 80 });
  
  // Service Details
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE DETAILS:', 110, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Vehicle: ${details.vehicleType.toUpperCase()}`, 110, 76);
  doc.text(`Package: ${pkg.name}`, 110, 81);
  doc.text(`Scheduled: ${details.date} @ ${details.timeSlot}`, 110, 86);
  
  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 110, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 25, 116);
  doc.text('Amount (INR)', 160, 116);
  
  // Table Body
  doc.setFont('helvetica', 'normal');
  doc.text(`${pkg.name} - ${details.vehicleType.toUpperCase()} Wash`, 25, 130);
  doc.text(`Rs. ${amount.toLocaleString()}`, 160, 130);
  
  // Footer / Total
  doc.line(20, 140, 190, 140);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, 150);
  doc.text(`Rs. ${amount.toLocaleString()}`, 160, 150);
  
  doc.setFontSize(10);
  doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 20, 150);
  
  // Terms
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Terms & Conditions:', 20, 180);
  doc.text('1. This is a computer-generated invoice.', 20, 185);
  doc.text('2. Payment is due at the time of service.', 20, 189);
  doc.text('3. For any queries, contact support@dritzz.com', 20, 193);
  
  // Final Greeting
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('THANK YOU FOR YOUR BUSINESS!', 105, 220, { align: 'center' });
  
  // Save PDF
  doc.save(`Dritzz_Invoice_${refId}.pdf`);
};
